
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const liveScoreData = {
        en: {
            seoTitle: "Live Score Football - Instant Match Updates | LiveBaz",
            seoDescription: "Follow live score football updates instantly. Get live football results, real-time match coverage, stats, and fixtures on LiveBaz.",
            title: "Live Score Football | Real-Time Match Analytics",
            content: `<h3>What Is Live Score Used For?</h3>
<p>Live Score, or live results, is one of the most popular tools for following sports matches. This service first became famous in football and today is used for various sports. In Live Score, the status of the match is displayed instantly; for example, as soon as a goal is scored in a football match, the result in the Live Score service is updated. This real-time coverage of matches makes fans feel directly involved in the game, even if they do not have access to a live video broadcast.</p>
<p>One of the first Live Score provider websites in the world started operating in the late 1990s and is still active today. Such websites, with the simple design they usually have, have focused on delivering results quickly and accurately. Over time, more features were added to Live Score; for example, today some live results services, in addition to showing the score, also provide details such as team lineups, match statistics, and minute-by-minute text commentary. In this way, Live Score has become a comprehensive tool for following matches.</p>

<h3>Benefits of Using Live Results (Live Score)</h3>
<p>Using Live Score services has many benefits for sports fans. In this section, we point out some of the most important benefits of live football results:</p>
<ul>
<li><strong>Instant and real-time notifications:</strong> The most important benefit of Live Score is the immediate updating of results. Without any delay, you learn about goals, cards, and other important events. This feature is especially valuable when you do not have access to TV or a live broadcast and you do not want to miss any key moments.</li>
<li><strong>Wide coverage of matches:</strong> Live Score services usually cover a wide range of matches, from the major leagues of the world to lesser-known competitions.</li>
<li><strong>No need for manual refresh:</strong> Most Live Score websites and apps display results automatically and in real time. The system automatically updates the information with every change in the match.</li>
<li><strong>Useful additional features:</strong> Advanced Live Scores do not stop at showing the result. Many of them display match statistics, ball possession percentage, number of shots, player lineups, and other useful information.</li>
<li><strong>Free and accessible:</strong> Most Live Score services are free, and you can easily access them through a website or by installing an app.</li>
</ul>

<h3>How Do We Use Live Score Services?</h3>
<p>Using Live Score is very easy and does not require any special technical knowledge. To benefit from live match results, you can follow the steps below:</p>
<ol>
<li><strong>Finding a reliable source:</strong> First, choose a reputable Live Score website or app. LiveBaz is a specialized site that offers complete features in this area.</li>
<li><strong>Entering the live results section:</strong> After entering the website or app, go to the “live results” or Live Scores section.</li>
<li><strong>Finding your desired match:</strong> In the list of live matches, find the match you want. Next to the names of the two teams, the current score and the minute of the match are shown.</li>
<li><strong>Viewing more details (optional):</strong> Click on the match to see goal scorers, cards, substitutions, and starting lineups.</li>
<li><strong>Enabling notifications (optional):</strong> Enable notifications for specific matches so that you receive a message on your phone during important events.</li>
</ol>

<h3>Introducing the LiveBaz Website; A Complete Live Score Experience</h3>
<p>LiveBaz is a comprehensive sports platform that provides a variety of services to football fans. One of the main sections of this site is football Live Score, which allows you to see live results of all major matches at a glance. On LiveBaz, you can easily stay informed about the latest goals and results and follow the details of each match.</p>

<h3>Live Football Results on LiveBaz</h3>
<p>In the live football results section of the LiveBaz website, ongoing matches from various Iranian and international leagues are displayed. Whether you are a fan of the Iranian Pro League or a follower of European leagues, LiveBaz covers important matches. Features include:</p>
<ul>
<li>Displaying live match results with real-time updates without needing to refresh the page.</li>
<li>Real-time match coverage with details (goal scorers, minutes, cards, stats).</li>
<li>Categorizing matches by league or country for easy access.</li>
</ul>

<h3>Other Features and Sections of the LiveBaz Website</h3>
<ul>
<li><strong>Schedule of upcoming matches:</strong> See the timing of matches in the coming days.</li>
<li><strong>Results of previous matches:</strong> View summaries and key events from yesterday's games.</li>
<li><strong>Sports analysis and football prediction:</strong> Expert reviews, team statistics, and predictions for possible results.</li>
<li><strong>Simple and attractive user interface:</strong> Easy access to different sections with appropriate color schemes and clear icons.</li>
<li><strong>News coverage and educational articles:</strong> Hot sports news, match sidelines, and football guides.</li>
</ul>

<h3>Conclusion: Why Choose LiveBaz for Live Score?</h3>
<p>Live Score is an essential tool for every football fan. The LiveBaz website has elevated the experience of using Live Score to a higher level. On LiveBaz, you gain access to analyses and useful additional features that double the excitement of following matches.</p>`
        },
        ar: {
            seoTitle: "لايف سكور كرة القدم - متابعة مباشرة لحظة بلحظة | لايف باز",
            seoDescription: "تابع لايف سكور لحظة بلحظة: نتائج مباشرة لكرة القدم، تغطية فورية للمباريات، إحصائيات ومواعيد اللقاءات على لايف باز.",
            title: "لايف سكور كرة القدم | تغطية وتحليلات فورية",
            content: `<p>لايف سكور يعني التغطية الفورية للمباريات والإعلان المباشر عن نتائج اللقاءات. وببساطة، اللايف سكور هو نظام يقوم بتحديث نتائج كرة القدم المباشرة وغيرها من الرياضات فور حدوث أي حدث (هدف، بطاقة، نهاية الشوط، إلخ).</p>
<p>بالنسبة لمشجع الرياضة الذي لا يستطيع مشاهدة المباراة مباشرة، يُعد اللايف سكور أفضل حل للبقاء على اطلاع بمجريات اللقاء في اللحظة نفسها.</p>

<h3>ما الغرض من اللايف سكور؟</h3>
<p>اللايف سكور، أو النتائج المباشرة، هو أحد أكثر الأدوات شعبية لمتابعة المباريات الرياضية. اشتهرت هذه الخدمة أولاً في كرة القدم، واليوم تُستخدم لمختلف الرياضات. في اللايف سكور يتم عرض حالة المباراة فورًا؛ فعلى سبيل المثال، بمجرد تسجيل هدف في مباراة كرة قدم يتم تحديث النتيجة في خدمة اللايف سكور مباشرة.</p>
<p>بدأت أوالى مواقع تقديم اللايف سكور في العالم العمل في أواخر التسعينيات وما يزال نشطاً حتى اليوم. ركّزت هذه المواقع على إيصال النتائج بسرعة ودقة. ومع مرور الوقت أضيفت مزايا أكثر إلى اللايف سكور؛ فمثلًا اليوم تقدم بعض خدمات النتائج المباشرة تفاصيل مثل تشكيلات الفرق، إحصائيات المباراة، والتعليق النصي دقيقة بدقيقة.</p>

<h3>فوائد استخدام النتائج المباشرة (لايف سكور)</h3>
<ul>
<li><strong>إشعارات فورية وفي الوقت الحقيقي:</strong> أهم ميزة في اللايف سكور هي تحديث النتائج فوراً. دون أي تأخير، تتعرف على الأهداف والبطاقات وغيرها من الأحداث المهمة.</li>
<li><strong>تغطية واسعة للمباريات:</strong> عادةً ما تغطي خدمات اللايف سكور نطاقاً واسعاً من المباريات، من الدوريات الكبرى في العالم إلى البطولات الأقل شهرة.</li>
<li><strong>عدم الحاجة للتحديث اليدوي:</strong> معظم مواقع وتطبيقات اللايف سكور تعرض النتائج تلقائياً وبشكل لحظي دون الحاجة لتحديث الصفحة.</li>
<li><strong>ميزات إضافية مفيدة:</strong> لا تتوقف الخدمات المتقدمة عند عرض النتيجة فقط، بل تعرض إحصائيات المباراة، نسبة الاستحواذ، تشكيلات اللاعبين وغيرها.</li>
<li><strong>مجانية وسهلة الوصول:</strong> معظم خدمات اللايف سكور مجانية ويمكن الوصول إليها بسهولة عبر الإنترنت أو تطبيقات الهاتف المحمول.</li>
</ul>

<h3>كيف نستخدم خدمات اللايف سكور؟</h3>
<ol>
<li><strong>العثور على مصدر موثوق:</strong> اختر موقعاً موثوقاً مثل LiveBaz الذي يقدم مزايا متكاملة في هذا المجال.</li>
<li><strong>الدخول إلى قسم النتائج المباشرة:</strong> توجه إلى قسم "النتائج المباشرة" أو Live Scores لرؤية المباريات الجارية.</li>
<li><strong>العثور على المباراة التي تريدها:</strong> ابحث عن المباراة التي تهمك لرؤية النتيجة الحالية ودقيقة المباراة.</li>
<li><strong>عرض المزيد من التفاصيل:</strong> انقر على المباراة لرؤية مسجلي الأهداف والبطاقات والتشكيلة الأساسية.</li>
<li><strong>تفعيل الإشعارات:</strong> في تطبيقات الهاتف، يمكنك تفعيل التنبيهات لتصلك رسالة عند تسجيل هدف.</li>
</ol>

<h3>التعريف بموقع LiveBaz؛ تجربة لايف سكور متكاملة</h3>
<p>LiveBaz هو منصة رياضية شاملة تقدم مجموعة متنوعة من الخدمات لعشاق كرة القدم. إحدى الأقسام الرئيسية في هذا الموقع هي لايف سكور كرة القدم، والتي تتيح لك رؤية النتائج المباشرة لأهم المباريات بنظرة واحدة.</p>

<h3>نتائج كرة القدم المباشرة على LiveBaz</h3>
<ul>
<li>عرض نتائج المباريات المباشرة بتحديث فوري دون الحاجة إلى تحديث الصفحة.</li>
<li>تغطية لحظية للمباراة مع التفاصيل (مسجلي الأهداف، البطاقات، الإحصائيات).</li>
<li>تصنيف المباريات حسب الدوري أو الدولة لراحة المستخدم.</li>
</ul>

<h3>ميزات وأقسام أخرى في موقع LiveBaz</h3>
<ul>
<li><strong>جدول المباريات القادمة:</strong> تعرف على مواعيد المباريات في الأيام المقبلة.</li>
<li><strong>نتائج المباريات السابقة:</strong> مشاهدة ملخص النتائج والأحداث من مباريات الأمس.</li>
<li><strong>تحليل رياضي وتوقعات كرة القدم:</strong> يقدم خبراء الموقع توقعات للنتائج المحتملة بناءً على الإحصائيات.</li>
<li><strong>واجهة مستخدم بسيطة وجذابة:</strong> سهولة الوصول إلى الأقسام المختلفة مع تصميم ألوان مريح وأيقونات واضحة.</li>
<li><strong>تغطية الأخبار ومقالات تعليمية:</strong> أخبار رياضية ساخنة ومقالات تعليمية لزيادة معرفتك بكرة القدم.</li>
</ul>

<h3>الخلاصة: لماذا تختار LiveBaz للايف سكور؟</h3>
<p>يُعد تطبيق LiveBaz مرجعاً متكاملاً رفع تجربة استخدام اللايف سكور إلى مستوى أعلى، حيث تحصل على تحليلات وميزات إضافية تضاعف متعة متابعة المباريات.</p>`
        },
        fa: {
            seoTitle: "نتایج زنده فوتبال - آپدیت لحظه‌ای مسابقات | لایو باز",
            seoDescription: "در این صفحه با مزایا و کاربردهای لایو اسکور، نحوه استفاده از آن و دلایل برتری لایو باز در ارائه نتایج زنده فوتبال آشنا شوید.",
            title: "نتایج زنده فوتبال | لایو اسکور و تحلیل آنی",
            content: `<p>لایو اسکور به معنای پوشش لحظه‌ای مسابقات و اعلام زنده نتایج بازی‌هاست. به زبان ساده، لایو اسکور سیستمی است که نتایج فوتبال زنده و سایر ورزش‌ها را به محض وقوع هر اتفاق (گل، کارت، پایان نیمه و...) به‌روزرسانی می‌کند.</p>

<h3>ما الغرض من اللايف سكور؟ (هدف از لایو اسکور چیست؟)</h3>
<p>لایو اسکور یا نتایج زنده، یکی از محبوب‌ترین ابزارها برای دنبال کردن مسابقات ورزشی است. این سرویس ابتدا در فوتبال به شهرت رسید و امروزه برای ورزش‌های مختلفی استفاده می‌شود. در لایو اسکور وضعیت بازی به صورت آنی نمایش داده می‌شود؛ برای مثال به محض اینکه در یک مسابقه فوتبال گلی به ثمر برسد، نتیجه در سرویس لایو اسکور بلافاصله تغییر می‌کند.</p>

<h3>فوائد استخدام النتائج المباشرة (مزایای استفاده از نتایج زنده)</h3>
<ul>
<li><strong>اعلان‌های فوری و در لحظه:</strong> مهم‌ترین ویژگی لایو اسکور، به‌روزرسانی سریع نتایج است. بدون هیچ تاخیری از گل‌ها، کارت‌ها و سایر اتفاقات مهم مطلع می شوید.</li>
<li><strong>پوشش گسترده مسابقات:</strong> سرویس‌های لایو اسکور معمولاً طیف وسیعی از بازی‌ها را پوشش می‌دهند؛ از لیگ‌های معتبر دنیا تا مسابقات کم‌نام‌وتر.</li>
<li><strong>عدم نیاز به رفرش دستی:</strong> اکثر سایت‌ها و اپلیکیشن‌های لایو اسکور، نتایح را به صورت خودکار نمایش می‌دهند و نیازی به بارگذاری مجدد صفحه نیست.</li>
<li><strong>ویژگی‌های جانبی مفید:</strong> لایو اسکورهای پیشرفته فقط به نمایش نتیجه بسنده نمی‌کنند و آمار بازی، درصد مالکیت توپ، تعداد شوت‌ها و ترکیب بازیکنان را نیز نمایش می‌دهند.</li>
<li><strong>رایگان و در دسترس بودن:</strong> اکثر این سرویس‌ها رایگان هستند و تنها با داشتن اتصال اینترنت به آخرین نتایج دسترسی خواهید داشت.</li>
</ul>

<h3>كيف نستخدم خدمات اللايف سكور؟ (چگونه از لایو اسکور استفاده کنیم؟)</h3>
<ol>
<li><strong>یافتن یک منبع معتبر:</strong> ابتدا یک سایت یا اپلیکیشن معتبر مانند LiveBaz را انتخاب کنید.</li>
<li><strong>ورود به بخش نتایج زنده:</strong> پس از ورود به سایت، به بخش "نتایج زنده" یا Live Scores بروید.</li>
<li><strong>پیدا کردن بازی مورد نظر:</strong> از لیست بازی‌های در حال جریان، مسابقه مورد نظر خود را پیدا کنید. در کنار نام تیم‌ها، نتیجه و دقیقه بازی مشخص است.</li>
<li><strong>مشاهده جزئیات بیشتر:</strong> با کلیک روی هر بازی می‌توانید زنندگان گل، کارت‌های زرد و قرمز و ترکیب تیم‌ها را ببینید.</li>
<li><strong>فعال‌سازی نوتیفیکیشن:</strong> در اپلیکیشن‌های موبایل می‌توانید اعلان مربوط به بازی‌های خاص را فعال کنید.</li>
</ol>

<h3>التعريف بموقع LiveBaz؛ تجربة لايف سكور متكاملة</h3>
<p>LiveBaz یک پلتفرم جامع ورزشی است که خدمات متنوعی را به عاشقان فوتبال ارائه می‌دهد. یکی از بخش‌های اصلی این سایت، لایو اسکور فوتبال است که اجازه می‌دهد نتایج زنده برترین مسابقات را در یک نگاه ببینید.</p>

<h3>نتایج زنده فوتبال در لایو باز</h3>
<ul>
<li>نمایش نتایج بازی‌های زنده با آپدیت آنی و بدون نیاز به رفرش صفحه.</li>
<li>پوشش لحظه‌ای بازی با جزئیات کامل (گلزنان، کارت‌ها، تعویض‌ها).</li>
<li>دسته‌بندی مسابقات بر اساس لیگ یا کشور برای دسترسی راحت‌تر.</li>
</ul>

<h3>سایر ویژگی‌ها و بخش‌های سایت لایو باز</h3>
<ul>
<li><strong>برنامه بازی‌های آینده:</strong> اطلاع از زمان برگزاری مسابقات در روزهای آتی.</li>
<li><strong>نتایج بازی‌های گذشته:</strong> مشاهده خلاصه نتایج و اتفاقات مهم بازی‌های دیروز.</li>
<li><strong>تحلیل ورزشی و پیش‌بینی فوتبال:</strong> کارشناسان سایت با بررسی آمار تیم‌ها، پیش‌بینی‌هایی از نتایج احتمالی ارائه می‌دهند.</li>
<li><strong>رابط کاربری ساده و جذاب:</strong> دسترسی آسان به بخش‌های مختلف با طراحی زیبا و آیکون‌های واضح.</li>
<li><strong>پوشش اخبار و مقالات آموزشی:</strong> اخبار داغ ورزشی و مقالات مرتبط با دنیای فوتبال.</li>
</ul>

<h3>الخلاصة: چرا لایو باز را برای لایو اسکور انتخاب کنیم؟</h3>
<p>سایت LiveBaz به عنوان یک مرجع کامل، تجربه استفاده از لایو اسکور را به سطح بالاتری ارتقا داده است تا لذت دنبال کردن مسابقات دوچندان شود.</p>`
        }
    };

    // Find or Create the Static Page
    let page = await prisma.staticPage.findUnique({
        where: { slug: 'live-score' }
    });

    if (!page) {
        page = await prisma.staticPage.create({
            data: { slug: 'live-score' }
        });
        console.log('Created StaticPage: live-score');
    }

    for (const [lang, data] of Object.entries(liveScoreData)) {
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
                        description: data.seoDescription
                    }
                });
                seoId = seo.id;
            } else {
                await prisma.seoFields.update({
                    where: { id: seoId },
                    data: {
                        title: data.seoTitle,
                        description: data.seoDescription
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
            console.log(`Updated ${lang} translation for Live Score.`);
        } else {
            const seo = await prisma.seoFields.create({
                data: {
                    title: data.seoTitle,
                    description: data.seoDescription
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
            console.log(`Created ${lang} translation for Live Score.`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
