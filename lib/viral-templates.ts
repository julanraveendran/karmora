export type ViralTemplateType = 'sell' | 'engagement';

export type ViralTemplate = {
  id: string;
  type: ViralTemplateType;
  template: { title: string; body: string };
  original: { title: string; body: string };
  stats: { upvotes: number; comments: number };
  bestSubs: string[];
};

const SELL_SUBS = ['r/SaaS', 'r/SideProject', 'r/indiehackers', 'r/microsaas'];
const ENGAGEMENT_SUBS = ['r/SaaS', 'r/Entrepreneur', 'r/startups', 'r/indiehackers'];

export const VIRAL_TEMPLATES: ViralTemplate[] = [
  {
    id: 'first-saas-money',
    type: 'sell',
    stats: { upvotes: 105, comments: 89 },
    bestSubs: SELL_SUBS,
    template: {
      title:
        'After [time period], and [number] failed projects, it finally happened. I MADE MY FIRST SAAS MONEY!',
      body:
        `Hey everyone!

I wanted to share a milestone that feels huge to me. I just made my first SaaS dollar.

The product is [Product Name] — [brief description of what it does].

It's my [number]th project since I started on this software thing [time period] ago. For [time period] I've shown up every day, shipping side projects in whatever gaps I could find, never making a cent. But a voice in my head kept saying "one day it'll happen".

Once I hit what I'd decided was my MVP, I started reaching out directly and leaving a link in relevant comments. Nothing too systematic.

Then the other night I was on the couch when my phone buzzed: "Your First Sale!". Unreal feeling.

It's not life-changing money, but it's the most motivating thing that's happened to me in a long time. If you're grinding on something, keep going — the first sale is out there.

Link if you want to check it out: [product URL]`,
    },
    original: {
      title:
        'After 1.2 years, and 4 failed projects, it finally happened. I MADE MY FIRST SAAS MONEY!',
      body:
        `Hello everyone!

I wanted to share with you a milestone that feels absolutely massive to me. I made my first SaaS money!

The tool I made is called WaitlistNow and it's a simple no-code tool to help founders validate their SAAS ideas. It also has built in analytics for the user.

It's my 5th project since starting this SAAS/software thing 1.2 years ago. For 1.2 years I've showed up daily on Reddit, building side projects whenever I have free time, and never made any money. But a voice in my head kept telling me "one day it will happen".

Once I had completed what I had defined as MVP, I started cold Dming others and leaving a link to it in comments here and there. Not really thinking much of it.

Then the other night I was relaxing on the couch, watching tv, when suddenly I get a notification on my phone from stripe: "Your First Sale!". Damn I was so excited. Unreal feeling.

Not life changing money, but it's the most motivating thing that's happened to me in a long time. If you're grinding on something, please just keep going, that first sale is out there

If you want to see what I made, here it is: https://www.waitlistsnow.com`,
    },
  },
  {
    id: 'first-internet-dollar',
    type: 'sell',
    stats: { upvotes: 56, comments: 46 },
    bestSubs: SELL_SUBS,
    template: {
      title: 'I just made my first internet dollar!',
      body:
        `my SaaS, [product URL] just closed its first sale of $[amount] 🥳

it's basically [brief description of what it does].

proof: [screenshot URL]

not much yet, but my heart is pounding. after ~[time period] of building in the shadows, this gives me enough fuel to keep going. the late nights suddenly feel worth it.`,
    },
    original: {
      title: 'I just made my first Internet dollar!',
      body:
        `my Saas, https://www.waitlistsnow.com/ has just made its first sale of $39🥳 its basically a no code waitlist creation tool to help founders validate their ideas and stop wasting time by validating before building.

proof: https://imgur.com/a/tg4ChYt

Its not much but my heart is skipping in excitement! After ~7 months of building in the shadows, this gives me soo much motivation to continue and kind of makes the loong hours and late nights worth it!`,
    },
  },
  {
    id: 'hundred-mrr-happy',
    type: 'sell',
    stats: { upvotes: 201, comments: 89 },
    bestSubs: SELL_SUBS,
    template: {
      title: "My tool earns $[amount]/month, and I'm happy with that",
      body:
        `Exactly what the title says. I make $[amount]/month from [Product Name] and although it doesn't sound huge, I'm really happy with it.

A couple of weeks ago I officially launched [Product Name]. It's [brief description of what it does]. It was my [number]th project after [number - 1] that went nowhere, so I was hoping for a different outcome.

After launch I:
- Emailed the waitlist
- Posted on Twitter, Bluesky, Peerlist
- Posted on Reddit

Day one I got [number] sales. A few days later the next few trickled in. One user even dmed me complimenting the product, which genuinely made my week.

I know people around here pull 5 figures a month. I'm ok being where I am. Everyone starts somewhere and $[amount]/month means something real is happening.

Product link: [product URL]. Next goal is $[next goal] MRR.`,
    },
    original: {
      title: "My tool earns $100/month, and I'm happy with that",
      body:
        `Just what the title says! I make $100/month with my product, and although it may not seem like a lot, I'm happy with it!

A couple of weeks ago, I officially launched WaitlistNow. It's a no-code waitlist creation tool to help founders validate their product ideas before building and automates the whole profess. It was my 5th project after 4 previous flops and I was hoping to receive a different outcome with this one.

So after I launched I:
- Sent an email to existing people on the waitlist
- Posted on twitter, bluesky, peerlist, etc.
- Posted on reddit

And the rest is history (maybe small for others but big for me)

On the first day after launching, I got 2 sales, and just a few days later, I received my 3rd sale before soon after receiving my 4th and 5th sales.

I am happy beyond words :)

PS - Here is a link to my product: https://www.waitlistsnow.com . The next goal for me is to get up to $250 mrr`,
    },
  },
  {
    id: 'first-micro-saas-dollar',
    type: 'sell',
    stats: { upvotes: 227, comments: 29 },
    bestSubs: SELL_SUBS,
    template: {
      title: 'I made my first dollars on the internet with a micro SaaS 🎉',
      body:
        `[screenshot of product in the post]

IN COMMENTS: The tool is called [Product Name] and it [brief description of what it does].

Really happy to finally have built something that's useful to real people :)`,
    },
    original: {
      title: 'I made my first dollars on the internet with a micro Saas 🎉',
      body:
        `A picture of the product in the post

IN COMMENTS: The tool is called BlueMigrate and it allows you to port your tweets backdated with their original date to Bluesky. This means they will be ordered as if they were posted on the original tweet date. (yes, that's possible on Bsky!)

I'm really happy that I was finally able to build something useful for the world :)`,
    },
  },
  {
    id: 'first-sale-from-reddit',
    type: 'sell',
    stats: { upvotes: 340, comments: 112 },
    bestSubs: SELL_SUBS,
    template: {
      title: "I just made a sale from Reddit. Honestly… I didn't think it was possible.",
      body:
        `For the longest time I thought of Reddit as a place to get roasted, get feedback, and maybe pull a few curious visitors who never convert.

Yesterday I shared a small update: [Product Name] now [something new or free you just shipped]. Not pushing paid features — just a genuinely useful change.

Today a user who tried the free version actually paid.

Right time, right need, right post for them.

Weird how showing up consistently and being honest about what you're doing eventually clicks. One sale doesn't sound big but it unlocked something in my head. Reddit is now officially in the "this works" bucket for me.`,
    },
    original: {
      title: "I just made a sale from Reddit. Honestly… I didn't think it was possible.",
      body:
        `I always thought Reddit was more for roasting your product, getting feedback, and maybe driving some curious visitors.

But yesterday, I shared a small update: Blogbuster, my SEO autopilot blog tool, now offers free blog hosting. no paid plan needed, just connect your domain and start writing.

I wasn't even pushing paid features. Just genuinely sharing a cool free offering.

And today I got this comment from a user who paid after trying the free version.

Right time, right need, right post for him.

Crazy how when you're transparent and just keep showing up, things can click.

So yeah, one sale might not sound like much but it makes me so happy. Reddit is now officially in the "actually works" category for me 😄`,
    },
  },
  {
    id: 'users-in-months',
    type: 'sell',
    stats: { upvotes: 612, comments: 178 },
    bestSubs: SELL_SUBS,
    template: {
      title: 'My app just hit [number] users in [time period]',
      body:
        `I shipped the first version in about [time period]. Started as something I needed for myself.

The product is [Product Name] — [brief description of what it does].

I shared progress on X in the build-in-public community and posted on Reddit a few times. Launched on Product Hunt which brought in the first real users.

Day [number]: [number] users
Day [number]: [number] users
Today: [number] users

Original goal was [number] users by end of year. Hit it early.

If you're looking for a product idea that actually gets users, here's what worked for me:
- Solve a problem you have yourself
- Talk to people like you to confirm the problem is real
- Ship something minimal, then iterate on feedback

Link: [product URL]`,
    },
    original: {
      title: 'My app just hit 1,600 users in 4 months!',
      body:
        `I built the first version of the product in about 30 days. It started out simple as something I needed for myself.

Over the past few months, growth has been strong.

The product helps you write SEO-optimized blog posts and articles by analyzing what's already going viral on Reddit. It looks at trending and highly discussed posts across subreddits to uncover what people are genuinely interested in.

I shared my progress on X in the Build in Public community and posted a few times on Reddit. I also launched the tool on Product Hunt which brought in the first users.

54 days in I hit 400 users
At day 98 I hit 850 users
Today the app has over 1,600 users

The original goal was 1,000 users by the end of the year but I hit that early.

If you are looking for a product idea that actually gets users, here is what worked for me:
Start by solving a problem you've experienced yourself.
Talk to others who are like you to make sure the problem is real.
Build something simple first, then use feedback to make it better over time.

The app is called Linkeddit if you want to check it out.`,
    },
  },
  {
    id: 'forget-unicorns',
    type: 'engagement',
    stats: { upvotes: 679, comments: 182 },
    bestSubs: ENGAGEMENT_SUBS,
    template: {
      title: 'Forget unicorns. $[amount] MRR solo feels better than $[amount] seed and stress',
      body:
        `I'm the founder of a SaaS I built solo. Bootstrapped, no investors. It [brief description of what it does]. Simple tool, solves a real problem, makes money from day one.

The more I build, the more I believe micro-SaaS > venture-backed startup. I've seen too many stories: "raised $[amount] pre-seed → burned through it → stressed trying to raise again." Meanwhile I just fix bugs, ship small features, talk to customers, grow at my own pace.

With micro-SaaS you can hit $5–20K MRR with high margins, no pressure, total control of your time. No team of 20. No deck for every decision. Just a useful product, a few customers who pay, and a feedback loop that works.

Would love to hear from others building solo or small — how's it going for you?`,
    },
    original: {
      title: 'Forget unicorns. $10K MRR solo feels better than $2M seed and stress',
      body:
        `I'm the founder of a SaaS company, which I built solo, bootstrapped, no investors. It scrapes fresh B2B leads from social platforms and Google Maps, no logins or cookies needed. Simple tool, solves a real problem and makes money from day one.

And honestly, the more I build, the more I believe micro SaaS > venture-backed startups. I've seen too many stories like "raised $700K pre-seed → burned through it → now stressed out trying to raise again." Meanwhile, I just fix bugs, ship small features, talk to customers and grow at my own pace.

With micro SaaS, you can get to $5K–$20K MRR with high margins, no pressure and total control over your time. You don't need a team of 20 or a slide deck for every decision. Just a useful product, a few customers who pay and a feedback loop that actually works.

Would love to hear from others building solo or small- how's it going for you? And if you're still debating startup vs micro SaaS, happy to share more behind the scenes if helpful.`,
    },
  },
  {
    id: 'stop-building-useless',
    type: 'engagement',
    stats: { upvotes: 1700, comments: 276 },
    bestSubs: ENGAGEMENT_SUBS,
    template: {
      title: 'Stop building useless sh*t',
      body:
        `"Check out my SaaS directory" — no one cares.
"I hit $10K MRR in 30 days — here's how" — stop lying.
"I created an AI chatbot" — no, you didn't create anything.

Most projects here won't exist in six months. And the culprit is you. Yes, you, who thought you'd get rich shipping yet another Next.js/Supabase/Postgres stack hosted on something serverless, because Cursor made it fast.

Just because AI tools help you code faster doesn't mean every AI-generated directory or chatbot needs to exist. We've seen this movie before: crypto, NFTs, dropshipping, now AI. Different costumes, same empty promises.

The only people consistently making money are the ones selling the dream. They don't even have to be experts — they just have to convince you you're one prompt away from freedom.

What we need is to return to fundamentals:
- Identify real problems you actually understand
- Use your unique skills and experiences to solve them
- Build genuine expertise over time
- Create value before worrying about monetization

Ask yourself:
- What are you genuinely good at?
- What problems do you understand better than others?
- What skills could you develop into real expertise?

If your purpose is to make money, start learning sales — not coding.`,
    },
    original: {
      title: 'Stop building useless sh*t',
      body:
        `"Check out my SaaS directory list" - no one cares
"I Hit 10k MRR in 30 Days: Here's How" - stop lying
"I created an AI-powered chatbot" - no, you didn't create anything

Most project we see here are totally useless and won't exist for more than a few months.

And the culprit is you. Yes, you, who thought you'd get rich by starting a new SaaS entirely "coded" with Cursor using the exact same over-kill tech stack composed of NextJS / Supabase / PostgreSQL with the whole thing being hosted on various serverless ultra-scalable cloud platforms.

Just because AI tools like Cursor can help you code faster doesn't mean every AI-generated directory listing or chatbot needs to exist. We've seen this movie before - with crypto, NFTs, dropshipping, and now AI. Different costumes, same empty promises.

The only people consistently making money in this space are those selling the dream and trust me, they don't even have to be experts. They just have to make you believe that you're just one AI prompt away from financial freedom.

Let's stop building for the sake of building. Let's start building for purpose - and if your purpose is making money, start learning sales, not coding.`,
    },
  },
  {
    id: 'vibecoded-saas',
    type: 'engagement',
    stats: { upvotes: 1000, comments: 181 },
    bestSubs: ENGAGEMENT_SUBS,
    template: {
      title: 'I just VIBECODED an entire SAAS: CHECK IT OUT on localhost:3000',
      body:
        `I keep seeing people say developers are done. Finding it funny.

What do you guys think?`,
    },
    original: {
      title: 'I just VIBECODED an entire SAAS: CHECK IT OUT on localhost:3000',
      body:
        `I keep seeing so many people saying developers are no longer needed. I find it them really funny.

What do you guys think?`,
    },
  },
  {
    id: 'zero-dollar-month',
    type: 'engagement',
    stats: { upvotes: 822, comments: 194 },
    bestSubs: ENGAGEMENT_SUBS,
    template: {
      title: 'How I made $0 in one month with $0 ads',
      body:
        `Step 1: Did nothing.
Step 2: Scrolled on Reddit.
Step 3: Checked my bank account. Still $0.
Step 4: Did nothing again.

But here's the thing: I didn't quit. I kept doing nothing every single day.

My advice to you? Stick with it. Trust the process of doing nothing. One day, your $0 might turn into… maybe $1. Dream big, keep going, and remember: success is just failing over and over until something works.`,
    },
    original: {
      title: 'How I made $0 in one month with $0 ads',
      body:
        `Step 1: Did nothing.

Step 2: Scrolled on Reddit

Step 3: Checked my bank account. Still $0.

Step 4: Did nothing again.

But here's the thing: I didn't quit. I kept doing nothing every day.

My advice to you? Stick with it. Trust in doing nothing. One day, your $0 might turn into... maybe $1. Dream big, keep going, and remember: success is just failing over and over until something works.`,
    },
  },
  {
    id: 'first-hundred-users',
    type: 'engagement',
    stats: { upvotes: 1200, comments: 267 },
    bestSubs: ENGAGEMENT_SUBS,
    template: {
      title: 'How to get your first 100 users (even if you suck at marketing)',
      body:
        `You don't need to be a genius. You just need to be relentless.

Here's the no-BS way to get your first 100:

**Launch everywhere.** Product Hunt, DevHunt, BetaList, Peerlist, AppSumo, Indie Hackers, Dailypings. If it lets you list — list.

**Post on socials like your life depends on it.** One post does nothing. Post 100 days in a row. Copy what worked. Tweak. Repeat.

**Stalk your competitors.** See where they're listed. Submit your product to the same places. Manually or with a tool — just do it.

**AI + SEO = free traffic.** Spin up 50 solid blog posts with ChatGPT. Get domain rating to 15+. Compound from there.

**Run small ads.** X, Google, Facebook, even Bing. Set it up once, let it run.

**Cold DMs + replies.** Find your people. Be short. Be real. Be helpful. One-sentence pitch. No spam.

There's no secret. Just consistent, unsexy work. Then you hit 100 users. Then 1,000.`,
    },
    original: {
      title: 'How to get your first 100 users (even if you suck at marketing)',
      body:
        `You don't need to be a genius. You just need to be relentless.

Here's the no-BS way to get your first 100 users:

Launch everywhere. Product Hunt, DevHunt, BetaList, Peerlist, AppSumo, Indie Hackers, Dailypings, etc. If it allows you to list your product—LIST IT.

Post on socials like your life depends on it. One post won't do sh*t. Do it 100 days in a row. Copy what went viral. Tweak. Repeat.

Stalk your competitors. See where they're listed. Submit your product there. Manually. Or use a tool. Just do it.

AI + SEO = free traffic. Spin up blog posts with ChatGPT. 50 solid ones can move mountains. Get that domain rating to 15+.

Run some damn ads. X, Google, Facebook... even Bing. Optimize it once, then let it run.

Cold DMs / replies. Find your people. Be short. Be real. Be helpful. 1 sentence pitch. No spam.

This is how the internet is won. No secret. Just consistent, boring work. And boom—100 users. Then 1000`,
    },
  },
  {
    id: 'self-promo-thread',
    type: 'engagement',
    stats: { upvotes: 243, comments: 375 },
    bestSubs: ENGAGEMENT_SUBS,
    template: {
      title: 'Time for self-promotion. What are you building in [year]?',
      body:
        `Use this format:

Startup Name — What it does
ICP (Ideal Customer Profile) — Who are they

I'll go first:

[Product Name] — [brief description of what it does]
ICP — [who your product is meant for]

Let's gooooooo 🚀

PS: upvote the thread so other builders and potential customers can see it. Someone reading this might be the first user of your SaaS.`,
    },
    original: {
      title: 'Time for self-promotion. What are you building in 2025?',
      body:
        `Use this format:

Startup Name - What it does
ICP (Ideal Customer Profile) - Who are they

I'll go first:

KarmaLinks - Backlink Exchange Club for B2B SaaS
ICP - Marketing/SEO pros & Startup Founders

Let's gooooooo 🚀

PS: Upvote this post so other makers or buyers can see it. Who knows someone reading this might check out your SaaS :)`,
    },
  },
];

export const REDDIT_TIPS = {
  postingTimes: [
    'Weekdays: 10 AM to 12 PM EST',
    'Weekends: 11:30 AM to 1 PM EST',
    'Avoid posting during major holidays',
  ],
  postingPractices: [
    'Do not spam. 2 to 3 posts per week is plenty',
    'Reply to every comment. Engagement compounds',
    'Reuse posts across subreddits, but never on the same day',
  ],
  accountTips: [
    'Warm up with a handful of genuine comments first',
    'Do not post anything until you have ~5 karma',
    'Join every sub you plan to post in. Learn the format first',
    'Read each sub\u2019s rules before you post',
  ],
  communityEngagement: [
    'Upvote and comment on others\u2019 posts regularly',
    'Answer questions in your niche to build credibility',
    'Mix sell posts with engagement posts, never just sell',
    'Go deep in 2\u20133 target subs instead of spreading thin',
  ],
};
