export default  Job;

type Job= {
    owner:Owner,
    title:string,
    type:string,
    url:string,
    createdAt:string,
    skills_suggest:string[],
    description:Description,
    department:string,
    seniority:string,
    _id:string
}

type Owner={
    companyName:string,
    rating:string,
    photo:string,
    locationAddress:string,
    teamSize:number,
    sector:string
}

type Description={
    oneSentenceJobSummary:string,
    keywords:string[],
    employmentType:string,
    salaryRangeMinYearly:number,
    salaryRangeMaxYearly:number,
    skillRequirement:string[]
}
