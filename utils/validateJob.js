function validateJob(data) {
  return {
    companyName:
      typeof data?.companyName === "string" && data.companyName.trim()
        ? data.companyName.trim()
        : "Unknown Company",

    jobDescription:
      typeof data?.jobDescription === "string" && data.jobDescription.trim()
        ? data.jobDescription.trim()
        : "Job description could not be extracted.",

    skills:
      Array.isArray(data?.skills)
        ? data.skills.filter(s => typeof s === "string").slice(0, 15)
        : [],

    aiSuggestion:
      typeof data?.aiSuggestion === "string" && data.aiSuggestion.trim()
        ? data.aiSuggestion.trim()
        : "Review core technical concepts, revise fundamentals, and prepare behavioral questions related to this role."
  };
}

module.exports = validateJob;
