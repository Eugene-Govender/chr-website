from pydantic import BaseModel, Field


class AnswerItem(BaseModel):
    question: str
    answer: str


class SubmitAnswersRequest(BaseModel):
    submission_id: int
    candidate_name: str
    role_title: str
    cv_text: str
    job_spec_text: str
    answers: list[AnswerItem] = Field(default_factory=list)


class JobResponse(BaseModel):
    id: int
    title: str
    salary_range: str | None = None
    closing_date: str | None = None
    min_requirements: str | None = None
    raw_text: str | None = None
    urgent: bool = False


class SyncJobItem(BaseModel):
    id: int
    title: str
    salary_range: str | None = None
    closing_date: str | None = None
    urgent: bool = False
    min_requirements: str | None = None
    raw_text: str | None = None
    status: str = "open"


class SyncJobsRequest(BaseModel):
    jobs: list[SyncJobItem] = Field(default_factory=list)
    api_key: str
