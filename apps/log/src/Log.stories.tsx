import type { Meta, StoryObj } from "@storybook/react";
import { LogRenderer } from "./App";
import type { LogContent } from "./schema";

const meta = {
  title: "Views/Log",
  component: LogRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof LogRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ApplicationLog: Story = {
  args: {
    data: {
      type: "log",
      version: "1.0",
      title: "Application Server",
      searchable: true,
      autoScroll: true,
      showTimestamp: true,
      entries: [
        { id: "1", timestamp: "2024-03-15T10:00:01.123Z", level: "info", source: "server", message: "Server starting on port 3000" },
        { id: "2", timestamp: "2024-03-15T10:00:01.200Z", level: "debug", source: "config", message: "Loading configuration from /etc/app/config.yaml" },
        { id: "3", timestamp: "2024-03-15T10:00:01.350Z", level: "info", source: "db", message: "Connected to PostgreSQL at localhost:5432" },
        { id: "4", timestamp: "2024-03-15T10:00:01.400Z", level: "debug", source: "db", message: "Connection pool initialized: min=2, max=10" },
        { id: "5", timestamp: "2024-03-15T10:00:01.500Z", level: "info", source: "cache", message: "Redis connection established" },
        { id: "6", timestamp: "2024-03-15T10:00:02.001Z", level: "info", source: "auth", message: "JWT middleware initialized with RS256" },
        { id: "7", timestamp: "2024-03-15T10:00:02.100Z", level: "warn", source: "auth", message: "Token expiry set to 24h -- consider reducing for production" },
        { id: "8", timestamp: "2024-03-15T10:00:02.200Z", level: "info", source: "routes", message: "Registered 42 API routes" },
        { id: "9", timestamp: "2024-03-15T10:00:02.300Z", level: "debug", source: "routes", message: "Health check endpoint: GET /api/health" },
        { id: "10", timestamp: "2024-03-15T10:00:03.000Z", level: "info", source: "server", message: "Server ready -- accepting connections" },
        { id: "11", timestamp: "2024-03-15T10:00:05.120Z", level: "info", source: "http", message: "GET /api/health 200 3ms" },
        { id: "12", timestamp: "2024-03-15T10:00:10.450Z", level: "info", source: "http", message: "POST /api/auth/login 200 45ms" },
        { id: "13", timestamp: "2024-03-15T10:00:10.500Z", level: "debug", source: "auth", message: "User admin@example.com authenticated successfully" },
        { id: "14", timestamp: "2024-03-15T10:00:15.800Z", level: "warn", source: "rate-limit", message: "Rate limit threshold at 80% for IP 192.168.1.50" },
        { id: "15", timestamp: "2024-03-15T10:00:20.100Z", level: "info", source: "http", message: "GET /api/users 200 12ms" },
        { id: "16", timestamp: "2024-03-15T10:00:25.300Z", level: "error", source: "db", message: "Query timeout after 5000ms on users_search", metadata: { query: "SELECT * FROM users WHERE name LIKE '%test%'", duration_ms: 5000 } },
        { id: "17", timestamp: "2024-03-15T10:00:25.350Z", level: "warn", source: "db", message: "Falling back to cached results for users_search" },
        { id: "18", timestamp: "2024-03-15T10:00:30.000Z", level: "info", source: "http", message: "GET /api/users 200 8ms (cached)" },
        { id: "19", timestamp: "2024-03-15T10:00:35.200Z", level: "debug", source: "cache", message: "Cache hit ratio: 87.3% (last 5 minutes)" },
        { id: "20", timestamp: "2024-03-15T10:00:40.100Z", level: "error", source: "webhook", message: "Failed to deliver webhook to https://hooks.example.com/events", metadata: { status: 503, retries: 3, next_retry: "2024-03-15T10:01:40.100Z" } },
        { id: "21", timestamp: "2024-03-15T10:00:45.500Z", level: "info", source: "cron", message: "Scheduled job 'cleanup_sessions' started" },
        { id: "22", timestamp: "2024-03-15T10:00:46.200Z", level: "info", source: "cron", message: "Removed 128 expired sessions" },
        { id: "23", timestamp: "2024-03-15T10:00:50.000Z", level: "fatal", source: "memory", message: "Heap usage at 95% -- OOM kill imminent", metadata: { heap_used_mb: 1900, heap_total_mb: 2048, rss_mb: 2100 } },
        { id: "24", timestamp: "2024-03-15T10:00:50.100Z", level: "warn", source: "gc", message: "Forcing garbage collection cycle" },
        { id: "25", timestamp: "2024-03-15T10:00:51.000Z", level: "info", source: "gc", message: "GC completed -- heap freed 400MB" },
        { id: "26", timestamp: "2024-03-15T10:00:55.300Z", level: "info", source: "http", message: "POST /api/uploads 201 1200ms" },
        { id: "27", timestamp: "2024-03-15T10:01:00.000Z", level: "debug", source: "storage", message: "File stored: uploads/2024/03/report.pdf (2.4MB)" },
        { id: "28", timestamp: "2024-03-15T10:01:05.100Z", level: "info", source: "http", message: "GET /api/dashboard 200 22ms" },
        { id: "29", timestamp: "2024-03-15T10:01:10.400Z", level: "warn", source: "deprecation", message: "API v1 endpoint /api/v1/users is deprecated, migrate to /api/v2/users" },
        { id: "30", timestamp: "2024-03-15T10:01:15.000Z", level: "info", source: "metrics", message: "Requests in last minute: 156, avg latency: 18ms, p99: 120ms" },
      ],
    } satisfies LogContent,
  },
};

export const ErrorsOnly: Story = {
  args: {
    data: {
      type: "log",
      version: "1.0",
      title: "Error Log",
      searchable: true,
      showTimestamp: true,
      levels: ["error", "fatal"],
      entries: [
        { id: "e1", timestamp: "2024-03-15T08:12:30.001Z", level: "error", source: "db", message: "Connection refused: ECONNREFUSED 127.0.0.1:5432", metadata: { errno: "ECONNREFUSED", syscall: "connect" } },
        { id: "e2", timestamp: "2024-03-15T08:12:30.500Z", level: "error", source: "db", message: "Failed to execute migration 20240315_add_index" },
        { id: "e3", timestamp: "2024-03-15T08:13:00.000Z", level: "fatal", source: "db", message: "Database connection pool exhausted -- shutting down", metadata: { active: 10, max: 10, waiting: 25 } },
        { id: "e4", timestamp: "2024-03-15T08:15:10.200Z", level: "error", source: "auth", message: "JWT verification failed: token signature invalid" },
        { id: "e5", timestamp: "2024-03-15T08:15:10.250Z", level: "error", source: "auth", message: "Unauthorized access attempt from IP 10.0.0.99", metadata: { path: "/api/admin", method: "DELETE" } },
        { id: "e6", timestamp: "2024-03-15T08:20:00.100Z", level: "error", source: "http", message: "POST /api/payments 500 -- Stripe API unreachable" },
        { id: "e7", timestamp: "2024-03-15T08:20:01.000Z", level: "error", source: "payments", message: "Payment processing failed for order ORD-4821", metadata: { order_id: "ORD-4821", amount: 99.99, currency: "USD" } },
        { id: "e8", timestamp: "2024-03-15T08:25:30.300Z", level: "fatal", source: "disk", message: "Disk space critical: /var/log at 99% capacity" },
        { id: "e9", timestamp: "2024-03-15T08:30:00.000Z", level: "error", source: "queue", message: "Message broker connection lost -- 12 messages undelivered" },
        { id: "e10", timestamp: "2024-03-15T08:30:05.100Z", level: "error", source: "queue", message: "Dead letter queue overflow: 500 messages dropped" },
        { id: "e11", timestamp: "2024-03-15T08:35:20.400Z", level: "error", source: "ssl", message: "TLS handshake failed with upstream proxy" },
        { id: "e12", timestamp: "2024-03-15T08:40:00.000Z", level: "fatal", source: "process", message: "Unhandled promise rejection -- process will terminate", metadata: { error: "TypeError: Cannot read property 'id' of undefined", stack: "at UserService.getUser (/app/src/services/user.ts:42:15)" } },
        { id: "e13", timestamp: "2024-03-15T08:40:00.100Z", level: "error", source: "cleanup", message: "Graceful shutdown failed -- forcing exit" },
        { id: "e14", timestamp: "2024-03-15T08:45:00.000Z", level: "error", source: "watchdog", message: "Health check failed 3 consecutive times" },
        { id: "e15", timestamp: "2024-03-15T08:45:01.000Z", level: "fatal", source: "watchdog", message: "Service marked unhealthy -- triggering restart", metadata: { restarts: 5, uptime_seconds: 1800 } },
      ],
    } satisfies LogContent,
  },
};

export const Minimal: Story = {
  args: {
    data: {
      type: "log",
      version: "1.0",
      monospace: true,
      searchable: false,
      showTimestamp: true,
      entries: [
        { timestamp: "10:00:01", level: "info", message: "Application initialized" },
        { timestamp: "10:00:02", level: "info", message: "Loading plugins..." },
        { timestamp: "10:00:03", level: "info", message: "Plugin: auth-handler loaded" },
        { timestamp: "10:00:03", level: "info", message: "Plugin: rate-limiter loaded" },
        { timestamp: "10:00:04", level: "info", message: "Plugin: request-logger loaded" },
        { timestamp: "10:00:04", level: "info", message: "All plugins loaded successfully" },
        { timestamp: "10:00:05", level: "info", message: "Binding to 0.0.0.0:8080" },
        { timestamp: "10:00:05", level: "info", message: "Worker 1 ready" },
        { timestamp: "10:00:05", level: "info", message: "Worker 2 ready" },
        { timestamp: "10:00:06", level: "info", message: "Server accepting connections" },
      ],
    } satisfies LogContent,
  },
};
