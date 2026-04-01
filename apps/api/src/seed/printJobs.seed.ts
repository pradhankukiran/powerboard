import { faker } from "@faker-js/faker";
import { Client } from "../models/Client.js";
import { Device } from "../models/Device.js";
import { User } from "../models/User.js";
import { PrintJob, PrintJobCreationAttributes } from "../models/PrintJob.js";

const TOTAL_PRINT_JOBS = 3000;

const BW_COST_PER_PAGE = 0.03;
const COLOR_COST_PER_PAGE = 0.12;

const DOC_NAMES = [
  "Quarterly_Report_Q{Q}_{YEAR}.pdf",
  "Invoice_{NUM}.pdf",
  "Meeting_Minutes_{DATE}.docx",
  "Contract_Amendment_{NUM}.pdf",
  "Employee_Handbook_v{NUM}.pdf",
  "Purchase_Order_PO-{NUM}.xlsx",
  "Board_Presentation_{DATE}.pptx",
  "Compliance_Checklist_{DATE}.pdf",
  "Expense_Report_{DATE}.xlsx",
  "Project_Proposal_{NUM}.docx",
  "Client_Statement_{DATE}.pdf",
  "Tax_Form_W2_{YEAR}.pdf",
  "Shipping_Label_{NUM}.pdf",
  "Policy_Update_Memo.docx",
  "Training_Materials_{DATE}.pdf",
  "Budget_Forecast_{YEAR}.xlsx",
  "Legal_Brief_{NUM}.docx",
  "Audit_Report_{DATE}.pdf",
  "Network_Diagram_v{NUM}.pdf",
  "Warranty_Certificate_{NUM}.pdf",
];

function generateDocName(): string {
  const template = faker.helpers.arrayElement(DOC_NAMES);
  return template
    .replace("{Q}", String(faker.number.int({ min: 1, max: 4 })))
    .replace("{YEAR}", String(faker.number.int({ min: 2024, max: 2026 })))
    .replace("{NUM}", String(faker.number.int({ min: 1000, max: 9999 })))
    .replace(
      "{DATE}",
      faker.date.recent({ days: 365 }).toISOString().slice(0, 10),
    );
}

export async function seedPrintJobs(
  devices: Device[],
  clients: Client[],
  users: User[],
) {
  const now = new Date();
  const oneYearAgo = new Date(now.getTime() - 365 * 86400000);

  // Only printer devices
  const printers = devices.filter((d) => d.type === "printer");
  if (printers.length === 0) {
    console.log("  Skipped print jobs: no printer devices found");
    return;
  }

  // Build printer -> client lookup
  const printerClientMap = new Map(
    printers.map((p) => [p.id, p.clientId]),
  );

  // Build client -> users lookup (all users can print)
  const allUserIds = users.map((u) => u.id);

  const records: (PrintJobCreationAttributes & { createdAt: Date; updatedAt: Date })[] = [];

  for (let i = 0; i < TOTAL_PRINT_JOBS; i++) {
    // Generate date with weekday bias
    let createdAt: Date;
    while (true) {
      createdAt = faker.date.between({ from: oneYearAgo, to: now });
      const dayOfWeek = createdAt.getDay();
      // Skip weekends 80% of the time
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        if (faker.datatype.boolean({ probability: 0.8 })) continue;
      }
      break;
    }

    // Add business hours bias (8am - 6pm)
    createdAt.setHours(faker.number.int({ min: 8, max: 17 }));
    createdAt.setMinutes(faker.number.int({ min: 0, max: 59 }));

    const printer = faker.helpers.arrayElement(printers);
    const clientId = printerClientMap.get(printer.id)!;
    const userId = faker.helpers.arrayElement(allUserIds);

    // Pages: 1-50, average ~8 (use a skewed distribution)
    const pages = Math.max(
      1,
      Math.min(50, Math.round(faker.number.float({ min: 0, max: 1 }) ** 2 * 49 + 1)),
    );

    // ~15% of total pages are color
    const colorPages = Math.round(pages * (faker.datatype.boolean({ probability: 0.15 }) ? faker.number.float({ min: 0.3, max: 1.0 }) : 0));

    // ~40% of jobs are duplex
    const isDuplex = faker.datatype.boolean({ probability: 0.4 });
    const duplexPages = isDuplex ? pages : 0;

    // Cost calculation
    const bwPages = pages - colorPages;
    const cost = bwPages * BW_COST_PER_PAGE + colorPages * COLOR_COST_PER_PAGE;

    // Status: 92% completed, 5% failed, 3% cancelled
    const statusRoll = faker.number.float({ min: 0, max: 1 });
    let status: "completed" | "failed" | "cancelled";
    if (statusRoll < 0.92) status = "completed";
    else if (statusRoll < 0.97) status = "failed";
    else status = "cancelled";

    const submittedAt = createdAt;
    let completedAt: Date | null = null;
    if (status === "completed") {
      // 10s to 5 minutes to print
      completedAt = new Date(
        submittedAt.getTime() +
          faker.number.int({ min: 10000, max: 300000 }),
      );
    } else if (status === "failed") {
      // Failed after a short attempt
      completedAt = new Date(
        submittedAt.getTime() +
          faker.number.int({ min: 5000, max: 60000 }),
      );
    }
    // cancelled jobs have no completedAt

    records.push({
      deviceId: printer.id,
      clientId,
      userId,
      documentName: generateDocName(),
      pages,
      colorPages,
      duplexPages,
      status,
      costEstimate: Math.round(cost * 100) / 100,
      printerName: printer.hostname,
      submittedAt,
      completedAt,
      createdAt,
      updatedAt: completedAt ?? createdAt,
    });
  }

  // Bulk insert in batches
  const BATCH = 500;
  let created = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    await PrintJob.bulkCreate(batch, { validate: false });
    created += batch.length;
  }

  console.log(`  Seeded ${created} print jobs from ${printers.length} printers`);
}
