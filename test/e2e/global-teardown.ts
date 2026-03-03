import { execSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";

async function globalTeardown() {
  const serverPidPath = join(process.cwd(), ".test-server-pid.json");
  if (existsSync(serverPidPath)) {
    try {
      const { pid } = JSON.parse(readFileSync(serverPidPath, "utf-8"));
      console.log(`Stopping dev server (PID: ${pid})...`);

      if (process.platform === "win32") {
        // On Windows, shell: true spawns cmd.exe which creates child processes.
        // We need to kill the whole process tree.
        try {
          execSync(`taskkill /F /T /PID ${pid}`, { stdio: "ignore" });
        } catch {
          // Process already exited
        }
      } else {
        try {
          process.kill(pid, "SIGTERM");
        } catch {
          // Process already exited
        }
      }
    } catch (_error) {
      console.warn("Could not stop dev server (may have already exited).");
    } finally {
      try {
        unlinkSync(serverPidPath);
      } catch {
        // file already gone
      }
    }
  }
}

export default globalTeardown;
