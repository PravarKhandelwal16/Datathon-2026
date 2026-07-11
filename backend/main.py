from fastapi import FastAPI

app = FastAPI(title="CIAP API", description="Crime Intelligence & Analytical Platform API")

@app.get("/")
def read_root():
    return {"message": "Welcome to the CIAP API"}
