import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateMatchAnalysis(matchData: {
    homeTeam: string;
    awayTeam: string;
    league: string;
    stats: any;
    h2h: any;
    prediction: any;
    lang: string;
}) {
    const { homeTeam, awayTeam, league, stats, h2h, prediction, lang } = matchData;

    const apiKey = process.env.GEMINI_API_KEY;

    // Construct a rich prompt for the AI
    const prompt = `
        You are a professional sports analyst and SEO expert. 
        Generate a deep tactical match analysis for the upcoming fixture: ${homeTeam} vs ${awayTeam} in the ${league}.
        
        Data points to include in analysis:
        - Win Probabilities: Home ${prediction?.winProbHome}%, Draw ${prediction?.winProbDraw}%, Away ${prediction?.winProbAway}%
        - BTTS Probability: ${prediction?.bttsProb}%
        - Over 2.5 Probability: ${prediction?.overProb}%
        - Recent H2H Form: ${JSON.stringify(h2h?.slice(0, 5))}
        
        Guidelines:
        1. Language: ${lang === 'fa' ? 'Persian' : lang === 'ar' ? 'Arabic' : 'English'}
        2. Format: Use HTML with H2 and H3 headings.
        3. Tone: Professional, authoritative, and data-driven.
        4. Structure:
           - Introduction: Briefly introduce the match context.
           - Tactical Setup: Analyze how both teams might play.
           - Key Statistics: Highlight important stats from the data provided.
           - Betting Verdict: Final prediction and why.
        5. Internal Linking: Mention keywords like "live score", "match prediction", "${homeTeam} vs ${awayTeam} tips".
        6. Length: minimum 400 words.
        
        DO NOT use placeholders. Generate the actual content based on the data points.
        Return ONLY the HTML content.
    `;

    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Cleanup in case Gemini adds markdown code blocks
            return text.replace(/```html/g, "").replace(/```/g, "").trim();
        } catch (error) {
            console.error("Gemini API Error:", error);
            // Fallback to template if API fails
        }
    }

    // Localized fallback content
    const fallbacks: Record<string, string> = {
        en: `
            <h2>${homeTeam} vs ${awayTeam} Prediction: Tactical Analysis & Betting Tips</h2>
            <p>The upcoming clash between <strong>${homeTeam}</strong> and <strong>${awayTeam}</strong> in the ${league} is shaping up to be a pivotal tactical battle. With ${homeTeam} holding a ${prediction?.winProbHome}% win probability, they enter as the favorites.</p>
            <h3>Tactical Setup</h3>
            <p>${homeTeam} has shown remarkable consistency. Their ability to maintain a high defensive line while transitioning quickly into attack has been their hallmark. <strong>${homeTeam} vs ${awayTeam} live score</strong> will likely depend on midfield control.</p>
            <h3>Final Verdict</h3>
            <p>Our final prediction is a <strong>narrow win for ${homeTeam}</strong> or a highly contested draw.</p>
        `,
        fa: `
            <h2>پیش‌بینی ${homeTeam} در مقابل ${awayTeam}: تحلیل تاکتیکی و نکات شرط‌بندی</h2>
            <p>رویارویی آینده بین <strong>${homeTeam}</strong> و <strong>${awayTeam}</strong> در ${league} به یک نبرد تاکتیکی محوری تبدیل شده است. با احتمال برد ${prediction?.winProbHome}٪ برای ${homeTeam}، آنها به عنوان شانس اول پیروزی وارد میدان می‌شوند.</p>
            <h3>چیدمان تاکتیکی</h3>
            <p>${homeTeam} ثبات فوق‌العاده‌ای از خود نشان داده است. توانایی آنها در حفظ خط دفاعی بالا در حالی که به سرعت به حمله تغییر وضعیت می‌دهند، ویژگی بارز آنها بوده است.</p>
            <h3>حکم نهایی</h3>
            <p>پیش‌بینی نهایی ما <strong>برد خفیف برای ${homeTeam}</strong> یا یک تساوی پرفشار است.</p>
        `,
        ar: `
            <h2>توقعات مباراة ${homeTeam} ضد ${awayTeam}: التحليل التكتيكي ونصائح المراهنة</h2>
            <p>تعتبر المواجهة القادمة بين <strong>${homeTeam}</strong> و <strong>${awayTeam}</strong> في ${league} معركة تكتيكية محورية. مع امتلاك ${homeTeam} احتمالية فوز بنسبة ${prediction?.winProbHome}٪، فإنهم يدخلون كمرشحين للفوز.</p>
            <h3>الإعداد التكتيكي</h3>
            <p>أظهر ${homeTeam} تناسقًا ملحوظًا. إن قدرتهم على الحفاظ على خط دفاعي عالٍ أثناء الانتقال السريع إلى الهجوم كانت السمة المميزة لهم.</p>
            <h3>الحكم النهائي</h3>
            <p>توقعاتنا النهائية هي <strong>فوز صعب لـ ${homeTeam}</strong> أو تعادل مثير.</p>
        `
    };

    return fallbacks[lang] || fallbacks.en;
}
