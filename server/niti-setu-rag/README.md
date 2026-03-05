# 🌾 Niti-Setu-RAG

AI-Powered Agricultural Scheme Eligibility Engine

Niti-Setu-RAG is a rule-based + RAG (Retrieval Augmented Generation)
eligibility engine that evaluates Indian farmers' eligibility for:

-   ✅ PM-KISAN (₹6,000/year income support)
-   ☀️ PM-KUSUM (Solar Subsidy -- Component A, B, C)

It combines: - Official Government Scheme PDFs - MongoDB Atlas Vector
Search - Sentence-Transformers Embeddings - Rule-Based Eligibility
Engine

------------------------------------------------------------------------

## 🚀 Features

### PM-KISAN

-   Land ownership validation
-   Income tax exclusion
-   Pension exclusion (\> ₹10,000/month)
-   Annual income ceiling logic
-   Structured reason codes
-   Document proof snippets
-   Confidence scoring

### PM-KUSUM (Component-Level)

-   Component A -- Solar Plant (\~2 acres required)
-   Component B -- Standalone Solar Pump
-   Component C -- Solarization of grid pump
-   SC/ST subsidy logic (up to 90%)
-   Component scoring
-   Best scheme recommendation

------------------------------------------------------------------------

## 🧠 Tech Stack

-   Python 3.13
-   FastAPI
-   MongoDB Atlas (Vector Search)
-   Sentence-Transformers (all-MiniLM-L6-v2)
-   Uvicorn
-   dotenv

------------------------------------------------------------------------

## ⚙️ Setup

1.  Create virtual environment

2.  Install dependencies: pip install -r requirements.txt

3.  Add .env file: MONGO_URI=your_connection_string

4.  Run server: uvicorn app:app --reload

------------------------------------------------------------------------

## 📬 Sample API Input

{ "land_size": 1.2, "income_tax_payer": false, "pension": 0,
"annual_income": 350000, "electricity_connection": false, "category":
"SC", "state": "Telangana" }

------------------------------------------------------------------------

## 🔒 Security

-   Secrets stored in .env
-   .env excluded from Git
-   No hardcoded credentials

------------------------------------------------------------------------

## 👤 Author

Siva Sai Davuluri\


------------------------------------------------------------------------

## 📜 License

MIT License
