FROM apache/superset:4.1.1

USER root
RUN pip install psycopg2-binary
USER superset

COPY infra/superset/superset_config.py /app/superset_config.py
ENV SUPERSET_CONFIG_PATH=/app/superset_config.py

CMD ["sh", "-c", "superset db upgrade && superset fab create-admin --username ${ADMIN_USERNAME:-admin} --firstname ${ADMIN_FIRST_NAME:-Admin} --lastname ${ADMIN_LAST_NAME:-Admin} --email ${ADMIN_EMAIL:-admin@powerboard.local} --password ${ADMIN_PASSWORD:-admin} || true && superset init && superset run -h 0.0.0.0 -p 8088 --with-threads"]
