const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const outputDir = "./output";
const uploadDir = "./uploads";

async function uploadImage(filePath) {
  const form = new FormData();
  form.append("image", fs.createReadStream(filePath));
  form.append("width", "300"); // Adjust width as needed
  form.append("height", "300"); // Adjust height as needed

  const response = await axios.post("http://localhost:3000/upload", form, {
    headers: form.getHeaders(),
  });
  return response.data.jobId;
}

async function getJobStatuses(jobIds) {
  const statuses = await Promise.all(
    jobIds.map(async (id) => {
      try {
        const response = await axios.get(
          `http://localhost:3000/jobs/${id}/status`
        );
        return response.data.status;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          return "not found";
        } else {
          console.error(`Error fetching status for job ${id}:`, error.message);
          return "error";
        }
      }
    })
  );
  return statuses;
}

async function main() {
  const imageDir = "./test_images";
  const files = fs
    .readdirSync(imageDir)
    .filter((file) => /\.(jpg|jpeg|png|gif)$/.test(file));
  const jobIds = [];

  try {
    fs.readdirSync(outputDir).forEach((file) => {
      const filePath = path.join(outputDir, file);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    });
    console.log("Output folder cleared.");
  } catch (error) {
    if (error.code === "ENOENT") {
      // Directory doesn't exist, create it
      fs.mkdirSync(outputDir);
      console.log("Output folder created.");
    } else {
      console.error("Error clearing output folder:", error.message);
    }
  }

  console.log("Starting uploads...");
  const startTime = Date.now();

  // Upload images sequentially
  for (const file of files) {
    const filePath = path.join(imageDir, file);
    try {
      const jobId = await uploadImage(filePath);
      jobIds.push(jobId);
      console.log(`Uploaded file with jobId: ${jobId}`);
    } catch (error) {
      console.error(`Failed to upload ${file}:`, error.message);
    }
  }

  // Monitor job statuses until all are done or failed
  console.log("Monitoring job statuses...");
  while (true) {
    const statuses = await getJobStatuses(jobIds);
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] Job statuses:`);
    jobIds.forEach((id, index) => {
      console.log(`Job ${id}: ${statuses[index]}`);
    });

    // Summary of statuses
    const statusCounts = statuses.reduce((acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    console.log(
      "Summary:",
      Object.entries(statusCounts)
        .map(([status, count]) => `${count} ${status}`)
        .join(", ")
    );

    // Check if all jobs are done or failed
    const allDone = statuses.every(
      (status) => status === "done" || status === "failed"
    );
    if (allDone) {
      break;
    }

    // Wait 0.5 second before checking again
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const endTime = Date.now();
  console.log(
    `\nAll jobs processed in ${(endTime - startTime) / 1000} seconds`
  );

  try {
    fs.readdirSync(uploadDir).forEach((file) => {
      const filePath = path.join(uploadDir, file);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    });
    console.log("Uplaods folder cleared.");
  } catch (error) {
    if (error.code === "ENOENT") {
      // Directory doesn't exist, create it
      fs.mkdirSync(uploadDir);
      console.log("Output folder created.");
    } else {
      console.error("Error clearing output folder:", error.message);
    }
  }
}

main().catch(console.error);
