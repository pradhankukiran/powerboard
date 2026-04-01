import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { setCredentials } from "./authSlice";
import { useLoginMutation } from "./authApi";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [login, { isLoading: loading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const data = await login({ email, password }).unwrap();
      dispatch(setCredentials({ token: data.token, user: data.user }));
      navigate("/");
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message || "Login failed";
      setError(message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white border border-gray-200 p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">
          PowerBoard
        </h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to your account</p>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm rounded-none focus:outline-none focus:border-blue-600 mb-4"
            required
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm rounded-none focus:outline-none focus:border-blue-600 mb-6"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 text-sm font-medium rounded-none hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
