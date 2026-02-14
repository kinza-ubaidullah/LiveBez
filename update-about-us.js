
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const aboutUsData = {
        en: {
            seoTitle: "LiveBaz | Football Analysis, Statistics and Betting Insights",
            title: "About Us | LiveBaz",
            content: `<p>LiveBaz is a specialized platform focused on football match analysis, live statistics, and betting market insights. The platform is built to help users make more informed and strategic betting decisions by relying on data, analysis, and market evaluation rather than random predictions.</p>

<p>At LiveBaz, we analyze dozens of football matches every day, covering major international leagues as well as local competitions. Our goal is to provide a clear and structured overview of each match before kickoff, helping users better understand the betting landscape.</p>

<h3>LiveBaz Analytical Approach</h3>

<h4>Data Driven Match Analysis</h4>
<p>LiveBaz analysis is based on real and up to date data. Our team evaluates multiple key factors, including:</p>
<ul>
<li>Team and player performance</li>
<li>Recent form and match trends</li>
<li>Head to Head results (H2H)</li>
<li>Home and away conditions</li>
<li>Motivation and match context</li>
<li>Goal statistics and attacking metrics</li>
</ul>
<p>This approach allows us to deliver realistic and practical match insights.</p>

<h4>Focus on Key Betting Markets</h4>
<p>LiveBaz goes beyond predicting final match results. We analyze the most popular and widely used betting markets, including:</p>
<ul>
<li>Over / Under</li>
<li>Both Teams To Score (BTTS)</li>
<li>Asian Handicap</li>
<li>Double Chance</li>
<li>Corners</li>
</ul>
<p>Each market is analyzed separately to offer multiple betting perspectives suitable for different betting strategies.</p>

<h4>Betting Odds Comparison</h4>
<p>LiveBaz displays betting odds from leading and well known international bookmakers, allowing users to:</p>
<ul>
<li>Compare odds across multiple betting sites</li>
<li>Identify the best available value (Value Bets)</li>
<li>Save time by accessing all relevant betting information in one place</li>
</ul>
<p>Match pages are designed to act as a complete football betting reference, combining analysis, statistics, and odds on a single page.</p>

<h4>Prediction Performance</h4>
<p>Thanks to its data driven methodology, LiveBaz predictions show a high success rate across many leagues and competitions. While betting always involves risk, our objective is to help users reduce uncertainty through structured analysis and transparent insights.</p>

<h4>Platform Development</h4>
<p>LiveBaz is one of the digital projects developed by Nitro Play Group, a group focused on building sports analytics platforms and betting related media solutions. The company emphasizes data based tools designed for users seeking professional level betting information.</p>

<h4>Responsibility and Terms of Use</h4>
<p>LiveBaz is not a betting operator and does not accept or process bets directly. All content is provided for analysis, informational, and odds comparison purposes only. Users are solely responsible for any betting decisions they make. Access to this website is restricted to users 18 years of age or older.</p>`
        },
        ar: {
            seoTitle: "LiveBaz | تحليل المباريات واحصائيات ومراهنات كرة القدم",
            title: "من نحن | LiveBaz",
            content: `<p>LiveBaz هي منصة متخصصة في تحليل مباريات كرة القدم، االحصائيات المباشرة، ودراسة اسواق المراهنات الرياضية. تم إنشاء المنصة لمساعدة المستخدمين على اتخاذ قرارات أدق وأكثر احترافية عند الدخول إلى اسواق المراهنات، اعتمادا على البيانات والتحليل وليس على التوقعات العشوائية.</p>

<p>في LiveBaz نقوم يوميا بتحليل عشرات المباريات من الدوريات العالمية المعروفة باالضافة إلى البطوالت المحلية، مع تقديم صورة واضحة وشاملة لكل مباراة قبل انطالقها.</p>

<h3>منهجية التحليل في LiveBaz</h3>

<h4>تحليل قائم على البيانات واالحصائيات</h4>
<p>تعتمد تحليالت LiveBaz على بيانات حقيقية واحصائيات دقيقة، حيث نقوم بدراسة:</p>
<ul>
<li>اداء الفرق والالعبين في المباريات االخيرة</li>
<li>نتائج المواجهات المباشرة (H2H)</li>
<li>عامل االرض والجمهور</li>
<li>الحالة الفنية والدوافع قبل المباراة</li>
<li>االرقام المتعلقة باالهداف والفرص</li>
</ul>
<p>كل ذلك يساهم في تقديم تحليل واقعي يساعد المستخدم على فهم المباراة بشكل افضل.</p>

<h4>التركيز على اسواق المراهنات االهم</h4>
<p>ال يقتصر محتوى LiveBaz على توقع نتيجة المباراة فقط، بل نقوم بتحليل اهم اسواق المراهنات مثل:</p>
<ul>
<li>Over / Under</li>
<li>(Both Teams To Score (BTTS</li>
<li>Asian Handicap</li>
<li>Double Chance</li>
<li>Corners</li>
</ul>
<p>يتم تحليل كل سوق بشكل منفصل لتوفير خيارات متعددة تناسب مختلف اساليب المراهنة.</p>

<h4>عرض ومقارنة odds المراهنات</h4>
<p>تقوم LiveBaz بعرض odds المراهنات من كبرى مواقع المراهنات العالمية، مما يتيح للمستخدم:</p>
<ul>
<li>مقارنة االسعار بين عدة شركات</li>
<li>تحديد افضل قيمة للمراهنة (Bet Value)</li>
<li>توفیه الوقت بدون الحاجة للتنقل بين عدة مواقع</li>
</ul>
<p>تم تصميم صفحات المباريات لتكون مرجعا كامال للمراهنات يشمل التحليل، االحصائيات، واالسعار في مكان واحد.</p>

<h4>دقة التوقعات في LiveBaz</h4>
<p>بفضل المنهجية المعتمدة على البيانات والتحليل، تتميز توقعات LiveBaz بنسبة نجاح مرتفعة في العديد من المباريات والدوريات. ومع ذلك، تبقى المراهنات نشاطا يحمل مخاطرة، ودورنا هو مساعدة المستخدم على تقليل هذه المخاطرة من خالل معلومات وتحليالت واضحة.</p>

<h4>فريق التطوير</h4>
<p>LiveBaz هي احد مشاريع Group Play Nitro، وهي مجموعة متخصصة في تطوير المنصات الرقمية واالعالم الرياضي المرتبط بالمراهنات عبر االنترنت. يترکز عمل المجموعة على بناء حلول تحليلية تعتمد على البيانات وتخدم المستخدمين المحترفين في هذا المجال.</p>

<h4>المسؤولية وشروط االستخدام</h4>
<p>LiveBaz ليست موقع مراهنات وال تقوم بقبول او تنفيذ اي رهانات بشكل مباشر. جميع المحتويات المعروضة هي ألغراض التحليل، عرض المعلومات، ومقارنة odds المراهنات فقط. يتحمل المستخدم المسؤولية الكاملة عن اي قرار مراهنة يتخذه. استخدام الموقع مسموح فقط لمن هم فوق 18 عاما.</p>`
        },
        fa: {
            seoTitle: "LiveBaz | تحلیل، آمار و پیش بینی شرط بندی فوتبال",
            title: "درباره ما | LiveBaz",
            content: `<p>LiveBaz یک پلتفرم تخصصی در زمینه تحلیل مسابقات فوتبال، آمار زنده و پیش بینی شرط بندی است که با هدف کمک به کاربران برای تصمیم گیری دقیق تر در بازارهای شرط بندی راه اندازی شده است. ما با بررسی داده های آماری، فرم تیم ها و تغییرات ضرایب، تلاش می کنیم دید شفاف تری از هر مسابقه فوتبال ارائه دهیم.</p>

<p>در LiveBaz هر روز ده ها مسابقه از لیگ های معتبر بین المللی و لیگ های محلی فوتبال تحلیل می شوند تا کاربران بتوانند با اطلاعات کامل تر وارد دنیای شرط بندی شوند.</p>

<h3>رویکرد تحلیلی LiveBaz</h3>

<h4>تحلیل مبتنی بر داده و آمار</h4>
<p>تحلیل های LiveBaz بر اساس داده های واقعی انجام می شود. ما عملکرد تیم ها و بازیکنان را بررسی می کنیم و فاکتورهایی مانند:</p>
<ul>
<li>فرم اخیر مسابقات</li>
<li>نتایج رودررو (H2H)</li>
<li>شرایط میزبانی و انگیزه تیم ها</li>
<li>آمار گل، مالکیت توپ و موقعیت ها</li>
</ul>
<p>را در تحلیل های خود لحاظ می کنیم.</p>

<h4>تمرکز بر بازارهای مهم شرط بندی</h4>
<p>LiveBaz فقط به پیش بینی نتیجه نهایی بازی ها محدود نمی شود. بازارهای محبوب شرط بندی از جمله:</p>
<ul>
<li>Over / Under</li>
<li>(Both Teams To Score (BTTS</li>
<li>هندیکپ آسیایی</li>
<li>شانس دوبل</li>
<li>کرنرها</li>
</ul>
<p>به صورت جداگانه بررسی و تحلیل می شوند تا کاربران بتوانند گزینه های مناسب تری انتخاب کنند.</p>

<h4>ضرایب شرط بندی و مقایسه سایت ها</h4>
<p>LiveBaz ضرایب شرط بندی را از سایت های بزرگ و معتبر شرط بندی بین المللی جمع آوری و نمایش می دهد. این امکان به کاربران کمک می کند:</p>
<ul>
<li>ضرایب مختلف را مقایسه کنند</li>
<li>بهترین Bet Value را شناسایی کنند</li>
<li>بدون مراجعه به چند سایت مختلف، تصمیم گیری سریع تری داشته باشند</li>
</ul>
<p>صفحات مسابقات به گونه ای طراحی شده اند که تمام اطلاعات مورد نیاز شرط بندی را در یک نگاه ارائه دهند.</p>

<h4>دقت پیش بینی ها در LiveBaz</h4>
<p>رویکرد داده محور LiveBaz باعث شده درصد برد پیش بینی ها در بسیاری از مسابقات و لیگ ها در سطح بالایی قرار بگیرد. هرچند شرط بندی همواره با ریسک همراه است، اما هدف ما ارائه تحلیل هایی است که به کاربران در مدیریت بهتر این ریسک کمک کند.</p>

<h4>تیم و توسعه پلتفرم</h4>
<p>LiveBaz یکی از پروژه های دیجیتال Group Play Nitro است؛ مجموعه ای فعال در حوزه توسعه پلتفرم های ورزشی و رسانه های مرتبط با شرط بندی آنلاین. تمرکز این مجموعه بر ایجاد ابزارهای تحلیلی و داده محور برای کاربران حرفه ای این حوزه می باشد.</p>

<h4>مسئولیت و شرایط استفاده</h4>
<p>LiveBaz یک سایت شرط بندی نیست و هیچ شرطی را به صورت مستقیم ثبت یا مدیریت نمی کند. تمامی محتوا صرفا جهت تحلیل، اطلاع رسانی و نمایش ضرایب شرط بندی ارائه می شود و مسئولیت نهایی هرگونه تصمیم شرط بندی بر عهده کاربر است. استفاده از این وب سایت فقط برای افراد بالای 18 سال مجاز می باشد.</p>`
        }
    };

    const page = await prisma.staticPage.findUnique({
        where: { slug: 'about-us' }
    });

    if (!page) {
        console.error('About Us page not found!');
        return;
    }

    for (const [lang, data] of Object.entries(aboutUsData)) {
        const translation = await prisma.staticPageTranslation.findUnique({
            where: {
                pageId_languageCode: {
                    pageId: page.id,
                    languageCode: lang
                }
            },
            include: { seo: true }
        });

        if (translation) {
            let seoId = translation.seoId;
            if (!seoId) {
                const seo = await prisma.seoFields.create({
                    data: {
                        title: data.seoTitle,
                        description: data.content.substring(0, 160).replace(/<[^>]*>?/gm, '')
                    }
                });
                seoId = seo.id;
            } else {
                await prisma.seoFields.update({
                    where: { id: seoId },
                    data: {
                        title: data.seoTitle,
                        description: data.content.substring(0, 160).replace(/<[^>]*>?/gm, '')
                    }
                });
            }

            await prisma.staticPageTranslation.update({
                where: { id: translation.id },
                data: {
                    title: data.title,
                    content: data.content,
                    seoId: seoId
                }
            });
            console.log(`Updated ${lang} translation for About Us.`);
        } else {
            const seo = await prisma.seoFields.create({
                data: {
                    title: data.seoTitle,
                    description: data.content.substring(0, 160).replace(/<[^>]*>?/gm, '')
                }
            });

            await prisma.staticPageTranslation.create({
                data: {
                    pageId: page.id,
                    languageCode: lang,
                    title: data.title,
                    content: data.content,
                    seoId: seo.id
                }
            });
            console.log(`Created ${lang} translation for About Us.`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
