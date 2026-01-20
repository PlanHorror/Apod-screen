import simpleGit, { SimpleGit } from "simple-git";
import * as path from "path";
import { main } from "./main";

async function commit(): Promise<void> {
  // Run main
  const des = await main();

  // Print the current time in UTC
  const now = new Date();
  console.log(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");

  if (des === null) {
    process.exit(0);
  }

  const repoPath = path.join(process.cwd(), "..");
  const git: SimpleGit = simpleGit(repoPath);

  try {
    // Add all files to the repository
    await git.add(".");

    // Commit the changes
    await git.commit(des);

    // Push the changes
    await git.push();

    console.log(`Successfully committed and pushed: ${des}`);
  } catch (error) {
    console.error("Git operation failed:", error);
  }
}

commit();
