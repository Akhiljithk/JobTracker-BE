function validateJob(data) {
  return {
    jobTitle:
      typeof data?.jobTitle === "string" && data.jobTitle.trim()
        ? data.jobTitle.trim()
        : "Unknown Job Title",

    companyName:
      typeof data?.companyName === "string" && data.companyName.trim()
        ? data.companyName.trim()
        : "Unknown Company",

    jobLocation:
      typeof data?.jobLocation === "string" && data.jobLocation.trim()
        ? data.jobLocation.trim()
        : "Not Specified",

    jobDescription:
      typeof data?.jobDescription === "string" && data.jobDescription.trim()
        ? data.jobDescription.trim()
        : "Job description could not be extracted.",

    companyLinkedinUrl: 
      typeof data?.companyLinkedinUrl === "string" ? data.companyLinkedinUrl : null,
  };
}

export default validateJob;