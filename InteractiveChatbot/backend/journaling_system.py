from pymongo import MongoClient
from datetime import datetime, timedelta
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet
import requests
import json
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image,
    PageBreak,
    ListFlowable,
    ListItem,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
import os
from dotenv import load_dotenv
import google.generativeai as genai
from groq import Groq

# Load environment variables
load_dotenv()

# Get API keys from environment
groq_api_key = os.getenv("GROQ_API_KEY")
gemini_api_key = os.getenv("GEMINI_API_KEY")

# Initialize clients
groq_client = Groq(api_key=groq_api_key)
genai_client = genai.Client(api_key=gemini_api_key)

# Configuration ------------------------------------------------------------------
mongo_uri = os.environ.get("MONGO_URI")

# Constants
EMOTIONS = ["Joy", "Sadness", "Anger", "Fear", "Surprise", "Disgust", "Neutral"]
# --------------------------------------------------------------------------------


def get_journal_entries(days_back):
    client = MongoClient(mongo_uri)
    db = client["journal_app"]
    collection = db["entries"]

    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)

    query = {"date": {"$gte": start_date, "$lte": end_date}}
    entries = collection.find(query).sort("date", 1)  # Sort by date ascending

    entries_df = pd.DataFrame(list(entries))

    return entries_df


# def analyze_with_llm(prompt, system_prompt="You are an expert psychologist analyzing journal entries."):
#     headers = {
#         "Authorization": f"Bearer {groq_api_key}",
#         "Content-Type": "application/json"
#     }

#     url = "https://api.groq.com/openai/v1/chat/completions"

#     payload = {
#         "model": "llama3-8b-8192",
#         "messages": [
#             {"role": "system", "content": system_prompt},
#             {"role": "user", "content": prompt}
#         ],
#         "temperature": 0.3,
#         "max_tokens": 8000,
#     }

#     response = requests.post(url, headers=headers, data=json.dumps(payload))
#     response_data = response.json()
#     print(response_data)
#     return response_data['choices'][0]['message']['content']


def analyze_with_llm(
    prompt, system_prompt="You are an expert psychologist analyzing journal entries."
):
    # Create the model instance
    model = genai_client.generative_model("gemini-2.0-flash")

    # Combine system prompt and user prompt
    full_prompt = f"{system_prompt}\n\n{prompt}"

    # Generate content
    response = model.generate_content(
        full_prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.3, max_output_tokens=8000
        ),
    )
    print(response)
    return response.text


def analyze_journal_entries(entries_df):
    analysis_results = []

    for _, entry in entries_df.iterrows():
        # Improved prompt for detailed analysis
        analysis_prompt = f"""
        Analyze this journal entry as a psychologist. Focus on key insights and actionable takeaways:

        Title: {entry['title']}
        Date: {entry['date']}
        Content: {entry['content']}

        Provide a concise yet comprehensive analysis covering:
        1. Emotional state (primary and secondary emotions)
        2. Cognitive patterns (positive/negative, rational/irrational)
        3. Stress indicators and coping mechanisms
        4. Notable behavioral patterns
        5. Key concerns or growth opportunities
        6. Specific recommendations for improvement

        Format your response with clear bullet points for each category.
        """

        analysis_text = analyze_with_llm(analysis_prompt)

        # Get a summary of the analysis
        summary_prompt = f"""
        Summarize this psychological analysis into 1-2 key actionable insights from the journal entry:
        {analysis_text}
        
        Focus on the most important takeaways that the journal writer should pay attention to.
        Format as bullet points.
        """

        summary_text = analyze_with_llm(summary_prompt)

        # Extract emotions via LLM
        emotion_prompt = f"""
        Analyze this journal entry and quantify the emotional content:
        {entry['content']}
        
        Return ONLY a JSON dictionary with values between 0-1 for these emotions: 
        {EMOTIONS}
        Example: {{"Joy": 0.5, "Sadness": 0.3, ...}}
        """

        try:
            emotion_json = analyze_with_llm(
                emotion_prompt,
                system_prompt="You are an emotion analysis tool. Return ONLY valid JSON.",
            )
            emotion_data = json.loads(emotion_json.strip("`").replace("json\n", ""))
        except:
            emotion_data = {e: 0 for e in EMOTIONS}  # Fallback if parsing fails

        analysis_results.append(
            {
                "entry_id": entry["_id"],
                "date": entry["date"],
                "title": entry["title"],
                "analysis": analysis_text,
                "summary": summary_text,
                "emotions": emotion_data,
            }
        )

    return pd.DataFrame(analysis_results)


def generate_visualizations(analysis_df):
    """Generate professional visualizations with proper error handling"""
    try:
        nltk.download("vader_lexicon", quiet=True)
        sia = SentimentIntensityAnalyzer()
    except Exception as e:
        print(f"Error initializing sentiment analyzer: {e}")
        return []

    chart_paths = []

    # 1. Sentiment Trend Chart (More Robust)
    sentiment_scores = []
    for _, row in analysis_df.iterrows():
        try:
            text = f"{row['title']} {row.get('content', '')} {row.get('analysis', '')}"
            sentiment = sia.polarity_scores(text)
            sentiment["date"] = row["date"].date()  # Store as date only
            sentiment_scores.append(sentiment)
        except Exception as e:
            print(f"Error analyzing sentiment for entry {row.get('title')}: {e}")

    if not sentiment_scores:
        print("Warning: No valid sentiment scores generated")
        return []

    sentiment_df = pd.DataFrame(sentiment_scores)

    # Handle single entry case
    if len(sentiment_df) > 1:
        daily_sentiment = sentiment_df.groupby("date").mean()
    else:
        daily_sentiment = sentiment_df.set_index("date")

    plt.figure(figsize=(10, 5))
    ax = plt.gca()

    # Smooth line for trend
    if len(daily_sentiment) > 1:
        daily_sentiment["compound_smooth"] = (
            daily_sentiment["compound"].rolling(window=2, min_periods=1).mean()
        )
        line = ax.plot(
            daily_sentiment.index,
            daily_sentiment["compound_smooth"],
            marker="o",
            color="#4e79a7",
            linewidth=2.5,
            markersize=8,
        )
    else:
        ax.bar(
            daily_sentiment.index,
            daily_sentiment["compound"],
            color="#4e79a7",
            width=0.5,
        )

    # Formatting
    ax.set_title("Mood Trend Over Time", pad=15, fontsize=14)
    ax.set_xlabel("Date", labelpad=10)
    ax.set_ylabel("Sentiment Score", labelpad=10)
    ax.grid(True, linestyle="--", alpha=0.4)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig("mood_trend.png", dpi=120, bbox_inches="tight")
    chart_paths.append("mood_trend.png")
    plt.close()

    # 2. Emotion Analysis (More Accurate)
    try:
        # Process emotion data with validation
        valid_emotions = []
        for _, row in analysis_df.iterrows():
            if isinstance(row.get("emotions"), dict):
                emotions = {
                    k: float(v)
                    for k, v in row["emotions"].items()
                    if k in EMOTIONS and 0 <= float(v) <= 1
                }
                if emotions:
                    emotions["date"] = row["date"].date()
                    valid_emotions.append(emotions)

        if not valid_emotions:
            print("Warning: No valid emotion data found")
            return chart_paths  # Return existing charts

        emotion_df = pd.DataFrame(valid_emotions)

        # Calculate mean emotion scores
        emotion_means = emotion_df[EMOTIONS].mean().sort_values(ascending=False)

        # Emotion Composition Chart
        plt.figure(figsize=(10, 5))
        ax = sns.barplot(
            x=emotion_means.values,
            y=emotion_means.index,
            palette="mako",
            edgecolor="black",
            linewidth=0.5,
        )

        # Add value labels
        for i, v in enumerate(emotion_means.values):
            ax.text(v + 0.02, i, f"{v:.2f}", color="black", va="center", fontsize=9)

        ax.set_title("Emotional Composition", pad=15, fontsize=14)
        ax.set_xlabel("Average Intensity (0-1)", labelpad=10)
        ax.set_xlim(0, 1.1)
        ax.set_ylabel("")
        plt.tight_layout()
        plt.savefig("emotional_composition.png", dpi=120, bbox_inches="tight")
        chart_paths.append("emotional_composition.png")
        plt.close()

        # 3. Emotion Radar Chart (New Visualization)
        if len(emotion_df) > 1:  # Only generate if we have multiple entries
            from math import pi

            plt.figure(figsize=(8, 8))
            ax = plt.subplot(111, polar=True)

            # Prepare data
            categories = EMOTIONS
            N = len(categories)
            angles = [n / float(N) * 2 * pi for n in range(N)]
            angles += angles[:1]

            # Plot each day
            for i, (_, row) in enumerate(emotion_df.iterrows()):
                values = row[categories].values.flatten().tolist()
                values += values[:1]
                ax.plot(
                    angles,
                    values,
                    linewidth=1,
                    linestyle="solid",
                    label=row["date"].strftime("%b %d"),
                    alpha=0.6,
                )

            # Formatting
            plt.xticks(angles[:-1], categories, color="grey", size=10)
            ax.set_rlabel_position(30)
            plt.yticks(
                [0.2, 0.4, 0.6, 0.8], ["0.2", "0.4", "0.6", "0.8"], color="grey", size=8
            )
            plt.ylim(0, 1)
            plt.title("Emotional Variation", pad=20, fontsize=14)
            plt.legend(loc="upper right", bbox_to_anchor=(1.3, 1.1))
            plt.tight_layout()
            plt.savefig("emotion_radar.png", dpi=120, bbox_inches="tight")
            chart_paths.append("emotion_radar.png")
            plt.close()

    except Exception as e:
        print(f"Error generating emotion charts: {e}")

    return chart_paths


def generate_pdf_report(analysis_df, chart_paths):
    doc = SimpleDocTemplate(
        "journal_analysis_report.pdf",
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    # Get default styles
    styles = getSampleStyleSheet()

    # Modify existing styles
    normal_style = styles["Normal"]
    normal_style.spaceBefore = 6
    normal_style.spaceAfter = 6
    normal_style.leading = 14

    # Add or modify custom styles
    custom_styles = {
        "Summary": {
            "parent": normal_style,
            "spaceBefore": 12,
            "spaceAfter": 12,
            "leading": 16,
        },
        "Bullet": {
            "parent": normal_style,
            "firstLineIndent": 0,
            "leftIndent": 20,
            "bulletIndent": 10,
            "spaceBefore": 6,
            "spaceAfter": 6,
            "bulletFontName": "Helvetica-Bold",
            "bulletFontSize": 10,
            "bulletColor": colors.HexColor("#2E86AB"),
        },
        "InsightHeader": {
            "parent": styles["Heading3"],
            "textColor": colors.HexColor("#2E86AB"),
            "spaceBefore": 18,
            "spaceAfter": 6,
            "fontName": "Helvetica-Bold",
        },
        "EntryDate": {
            "parent": styles["Heading3"],
            "textColor": colors.HexColor("#5B5B5B"),
            "fontSize": 12,
            "spaceBefore": 20,
            "spaceAfter": 8,
            "fontName": "Helvetica",
        },
    }

    for name, style_params in custom_styles.items():
        if name not in styles:
            styles.add(ParagraphStyle(name=name, **style_params))

    elements = []

    # Title Page
    title = Paragraph(
        "<b>Psychological Journal Analysis Report</b>", style=styles["Title"]
    )

    # Handle date range safely
    try:
        if "date" in analysis_df.columns:
            date_min = analysis_df["date"].min().strftime("%B %d, %Y")
            date_max = analysis_df["date"].max().strftime("%B %d, %Y")
            date_range = f"{date_min} to {date_max}"
        else:
            date_range = "the selected period"
    except Exception as e:
        print(f"Error processing dates: {e}")
        date_range = "the selected period"

    subtitle = Paragraph(
        f"<i>Analysis Period: {date_range}</i>", style=styles["Heading2"]
    )

    elements.extend([title, Spacer(1, 24), subtitle, Spacer(1, 48)])

    # Executive Summary
    elements.append(Paragraph("<b>Executive Summary</b>", styles["Heading1"]))
    elements.append(Spacer(1, 12))

    # Generate comprehensive summary
    try:
        if "summary" in analysis_df.columns:
            all_summaries = "\n".join(analysis_df["summary"])
        else:
            all_summaries = "No summary data available"

        summary_prompt = f"""Create a well-structured executive summary from these insights:
        {all_summaries}
        
        Return formatted with clear sections:
        ### Key Patterns
        - Bullet point 1
        - Bullet point 2
        
        ### Emotional Trends
        - Bullet point 1
        - Bullet point 2
        
        ### Recommendations
        - Bullet point 1
        - Bullet point 2
        """

        executive_summary = analyze_with_llm(summary_prompt)
        # Process each section
        for line in executive_summary.split("\n"):
            line = line.strip()
            if not line:
                continue

            if line.startswith("###"):
                elements.append(Paragraph(line[3:].strip(), styles["InsightHeader"]))
            elif line.startswith("-"):
                elements.append(Paragraph(line[1:].strip(), styles["Bullet"]))
            else:
                elements.append(Paragraph(line, styles["Normal"]))
    except Exception as e:
        print(f"Error generating summary: {e}")
        elements.append(Paragraph("Summary analysis unavailable", styles["Normal"]))

    elements.append(Spacer(1, 24))

    # Detailed Analysis Section
    elements.append(Paragraph("<b>Detailed Entry Analysis</b>", styles["Heading1"]))
    elements.append(Spacer(1, 12))

    if "title" in analysis_df.columns and "summary" in analysis_df.columns:
        for _, row in analysis_df.iterrows():
            # Handle date safely
            try:
                date_str = (
                    row["date"].strftime("%A, %B %d, %Y")
                    if "date" in row
                    else "Unknown date"
                )
            except:
                date_str = "Unknown date"

            entry_header = Paragraph(
                f"<b>{date_str}</b> - {row['title']}", styles["EntryDate"]
            )
            elements.append(entry_header)

            # Process each bullet point
            for line in row["summary"].split("\n"):
                line = line.strip()
                if line:
                    # Clean numbering/markdown
                    if line.startswith(("1.", "2.", "3.", "4.", "5.", "*")):
                        line = line[2:].strip() if line[1] == "." else line[1:].strip()
                    elements.append(Paragraph(line, styles["Bullet"]))

            elements.append(Spacer(1, 12))
    else:
        elements.append(
            Paragraph("No detailed analysis data available", styles["Normal"])
        )

    # Visualizations Section
    if chart_paths:
        elements.append(PageBreak())
        elements.append(
            Paragraph("<b>Psychological Trends Visualization</b>", styles["Heading1"])
        )
        elements.append(Spacer(1, 12))

        for idx, chart_path in enumerate(chart_paths, 1):
            desc = ""
            if "mood_trend" in chart_path:
                desc = "Figure 1: Mood fluctuation trend over time"
            elif "emotional_composition" in chart_path:
                desc = "Figure 2: Dominant emotional states distribution"
            elif "emotion_radar" in chart_path:
                desc = "Figure 3: Daily emotional state variations"

            if desc:
                elements.append(Paragraph(desc, styles["Normal"]))
                elements.append(Spacer(1, 4))

            try:
                img = Image(chart_path, width=450, height=300)
                elements.append(img)
                elements.append(Spacer(1, 24))
            except Exception as e:
                print(f"Could not include image {chart_path}: {e}")

    # Generate PDF
    doc.build(elements)
    return "journal_analysis_report.pdf"


def main():
    print("Journal Analysis Report Generator")
    print("--------------------------------")

    days_back = int(
        input("How many days of journal entries would you like to analyze? ")
    )

    print("\nStep 1/4: Retrieving journal entries...")
    entries_df = get_journal_entries(days_back)
    print(f"Retrieved {len(entries_df)} entries.")

    print("\nStep 2/4: Analyzing entries...")
    analysis_df = analyze_journal_entries(entries_df)
    print("Analysis complete.")

    print("\nStep 3/4: Generating visualizations...")
    chart_paths = generate_visualizations(analysis_df)
    print(f"Created {len(chart_paths)} charts.")

    print("\nStep 4/4: Generating PDF report...")
    report_path = generate_pdf_report(analysis_df, chart_paths)
    print(f"\nReport successfully generated: {report_path}")


if __name__ == "__main__":
    main()
