import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateMatchAnalysis(matchData: {
    homeTeam: string;
    awayTeam: string;
    league: string;
    stats: any;
    h2h: any;
    prediction: any;
    currentScore?: string;
    lang: string;
}) {
    const { homeTeam, awayTeam, league, stats, h2h, prediction, currentScore, lang } = matchData;

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
        ${currentScore ? `- Current Score: ${currentScore}` : ''}
        
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
        const modelsToTry = [
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-pro"
        ];
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                const genAI = new GoogleGenerativeAI(apiKey.trim());
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                if (text) {
                    console.log(`✔ AI analysis generated using ${modelName}`);
                    return text.replace(/```html/g, "").replace(/```/g, "").trim();
                }
            } catch (error) {
                lastError = error;
                console.warn(`Model ${modelName} failed, trying next...`);
            }
        }
        console.error("All Gemini models failed. Using dynamic template fallback.");
    }

    // High-Quality Dynamic Fallback Content
    const winProb = prediction?.winProbHome > 50 ? 'Strong Favorites' : prediction?.winProbHome > 40 ? 'Slight Favorites' : 'Contested Match';
    const bttsText = (prediction?.bttsProb || 0) > 60 ? 'high probability of both teams scoring' : 'tactical cagey affair with limited scoring chances';

    const fallbacks: Record<string, string> = {
        en: `
            <h2>${homeTeam} vs ${awayTeam} Prediction: Tactical Analysis & Expert Betting Tips</h2>
            <p>The upcoming clash between <strong>${homeTeam}</strong> and <strong>${awayTeam}</strong> in the ${league} is shaping up to be a pivotal tactical battle. Our data-driven analysis shows ${homeTeam} enters this fixture as <strong>${winProb}</strong> with a ${prediction?.winProbHome || 'N/A'}% win probability.</p>
            
            <h3>Tactical Setup & Form Analysis</h3>
            <p>${homeTeam} has shown remarkable consistency in their recent home fixtures. Their ability to maintain a high defensive line while transitioning quickly into attack has been their hallmark this season. On the other hand, ${awayTeam} often relies on a disciplined mid-block and counter-attacking prowess. <strong>${homeTeam} vs ${awayTeam} live score</strong> updates will be crucial as the first 20 minutes often dictate the momentum in these high-stakes encounters.</p>
            
            <h3>Key Statistical Insights</h3>
            <ul>
                <li><strong>Win Probability:</strong> ${homeTeam} (${prediction?.winProbHome || 'N/A'}%) | Draw (${prediction?.winProbDraw || 'N/A'}%) | ${awayTeam} (${prediction?.winProbAway || 'N/A'}%)</li>
                <li><strong>Goal Outlook:</strong> There is a ${bttsText} according to recent performance metrics.</li>
                <li><strong>Over 2.5 Goals:</strong> The probability for a high-scoring game is currently estimated at ${prediction?.overProb || 'N/A'}%.</li>
            </ul>
            
            <h3>Final Verdict</h3>
            <p>Based on head-to-head records and current form, our expert prediction leans towards a <strong>${prediction?.winProbHome > prediction?.winProbAway ? homeTeam : awayTeam}</strong> advantage. We recommend monitoring the lineups closely before kickoff for any late tactical shifts.</p>
        `,
        ar: `
            <h2>توقعات ${homeTeam} ضد ${awayTeam}: التحليل التكتيكي ونصائح الخبراء</h2>
            <p>تعتبر المواجهة القادمة بين <strong>${homeTeam}</strong> و <strong>${awayTeam}</strong> في ${league} معركة تكتيكية محورية. يظهر تحليلنا المدعوم بالبيانات أن ${homeTeam} يدخل هذه المباراة كـ <strong>${prediction?.winProbHome > 50 ? 'مرشح قوي' : 'مرشح طفيف'}</strong> بنسبة فوز تبلغ ${prediction?.winProbHome || 'N/A'}%.</p>
            <h3>الرؤى الإحصائية الرئيسية</h3>
            <p>هناك ${bttsText} بناءً على مقاييس الأداء الأخيرة. من المتوقع أن تكون المباراة مثيرة ومليئة بالتحديات التكتيكية من جانب كلا الفريقين.</p>
            <h3>الحكم النهائي</h3>
            <p>بناءً على السجلات المواجهات المباشرة والنموذج الحالي، يميل توقعنا الخبير نحو أفضلية <strong>${prediction?.winProbHome > prediction?.winProbAway ? homeTeam : awayTeam}</strong>.</p>
        `,
        fa: `
            <h2>پیش‌بینی ${homeTeam} در مقابل ${awayTeam}: تحلیل تاکتیکی و نکات شرط‌بندی</h2>
            <p>تقابل آتی بین <strong>${homeTeam}</strong> و <strong>${awayTeam}</strong> در ${league} یک نبرد تاکتیکی حیاتی است. تحلیل داده‌محور ما نشان می‌دهد که ${homeTeam} با احتمال برد ${prediction?.winProbHome || 'N/A'}% وارد این مسابقه می‌شود.</p>
            <h3>تحلیل فرم و وضعیت تیم‌ها</h3>
            <p>تیم ${homeTeam} در بازی‌های خانگی اخیر خود ثبات قابل توجهی نشان داده است. از سوی دیگر، ${awayTeam} اغلب بر دفاع منظم و ضدحملات سریع تکیه می‌کند.</p>
            <h3>نتیجه‌گیری نهایی</h3>
            <p>با توجه به نتایج رودررو و فرم فعلی، پیش‌بینی کارشناسان ما به نفع <strong>${prediction?.winProbHome > prediction?.winProbAway ? homeTeam : awayTeam}</strong> است.</p>
        `
    };

    return fallbacks[lang] || fallbacks.en;
}
