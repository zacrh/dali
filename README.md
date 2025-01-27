<p align="center">
  <img src="/public/dalibook-wide.png" alt="Dalibook Wide Logo" width="300" style="border-radius: 10px;" />
</p>

# The Dalibook

Dalibook is a special type of social network, designed purposefuly for members of the DALI Lab. It's a place for members to share their updates about projects, show love to other members (on or off their team!), and learn about what's happening in the lab. Additionally, profiles allow members to share interests, fun facts, and their major. Dalibook is my solution to the social media challenge as part of DALI's 2025 application. Check it out at [thedalibook.com](https://dalibook.com) ([direct link](https://dali.0z.gg)).

Watch the demo [here](demo.thedalibook.com) ([demo.thedalibook.com](https://demo.thedalibook.com)).

## Features
- **Profiles**: Members can create profiles with their name, major, interests, and fun facts — as well as their roles in DALI.
- **Posts**: Members can share what they're working on by posting on the platform.
    - **Likes**: If you're really inclined, you can even like posts!
- **Projects**: Arguably the bread and butter of Dalibook and what makes it unique. Members can create and join projects, where they're able to post project-specific updates and tailor project-specific feeds (whether it's through the following feed on the home page or on the post fees on the project page).
    - Not only can you join projects and see which ones you're in, but there's also discovery on the `/projects` page.
- **Easy Onboarding**: If a new user is part of the test data provided in the application challenge, we'll connect their account to their information. If not, we'll get them set up with their first name, last name, and class year pulled from their email.
- **Fast**: It's *fast*. After the initial few loading spinners, page transitions will feel snappy — even after a hard refresh.

## How to Use
1. Clone this repository
2. `cd` into the cloned repository
3. Install Node.js & NPM if you haven't already
    - `brew install node` if you're on Mac
    - Download the [Windows Installer](https://nodejs.org/en/#home-downloadhead) directly from the [nodejs.org](https://nodejs.org) website if you're on Windows
    - `cinst nodejs.install` using Chocolatey
4. Install dependencies using `npm i`
5. Set up a `.env` file mirroring the `example.env` file (instructions within the file)
6. Generate your local Prisma schema with `npx prisma generate --schema src/prisma/schema.prisma`
    - Push it to your database with `npx prisma db push --schema src/prisma/schema.prisma`
7. Run the development server using `npm run dev`
8. Seed your database with the provided member data by visiting `http://127.0.0.1:3000/api/extra/load_members`
9. Visit [127.0.0.1:3000](http://127.0.0.1:3000) in your browser to see the app in action! 🚀
    - Feel free to make an account with your email — will only work if you followed the SMTP setup in `example.env`

### Notes
- If you're encountering an error after signing in on the official site (dali.0z.gg), just navigate directly to [dali.0z.gg/onboarding](https://dali.0z.gg/onboarding) in your browser to finish onboarding — some issue with session tokens in production.

## Learning Journey
### Inspiration
I chose the social media challenge in particular since it had to do with displaying member information. Earlier in the term, I wanted to see all of the members + alumni in DALI Lab, but ended up just finding a Notion page with all of the members, so it seemed like a good opportunity to fix that. Pretty soon I realized a landing page like that was a little too simple, so I thought about Google's Memegen (their internal message board), and wanted to make a similar platform for DALI — built around projects members are working on specifically.

### Impact
I think the premise of "build in public" is cool, but on more open social media platforms like X, it can quickly devolve into a game of engagement baiting rather than genuine sharing. In an attempt to avoid that noise and make *more* people willing to share, a closed platform like Dalibook could be a good solution. It's a place where members can share their updates about projects, show love to other members (on or off their team!), and learn about what's happening in the lab. Very low stakes, but a very fun way to keep up with the state of the lab.

### New Technology
I really forced myself to use Tailwind throughout the duration of this project (I've written so much normal CSS that I often find myself dropping Tailwind halfway through) — and didn't need to create more than one (!) typescript es-lint rule for this project. Also spent a decent amount of time tinkering with caching on the client side — an attempt to balance maintaining freshness of content and a snappy user experience (the solution being show the cached feed/data while fetching the new data in the background).

### Technology Choices
- **Next.js** made sense for an app like this. While I actually really enjoy using Astro (among the Javascript frameworks), an app as dynamic as Dalibook called for a more traditional React setup.
- **Prisma** for the ORM was more of a personal choice. If I were to do it again, however, I'd probably opt for Drizzle given its ground-up TypeScript support.
- **Next Auth** for authentication since I thought it would handle sessions well. While it did for the most part, I found myself wanting more control over some of the stuff that was happening under the hood (like magic link verifications, my own Redis instance, etc.).
- **PostgreSQL/Supabase** for the database. It's the easiest to set up for side projects, even though it might not scale well (both cost and speed-wise). Alternatively could have hosted my own instance (and app), Dockerized both and thrown them on a VPS.

### Challenges
- **Caching**: I wanted to cache the feed and project data on the client side to make the app feel snappy, but also wanted to keep the data fresh. I ended up using a combination of stale-while-revalidate and a custom cache to achieve this.
- **Liking**: I didn't want people to be able to spam like requests, so ended up debouncing the like button. This was a little tricky to get right, but I think it works well now.
- **Authentication/Session Management**: I was honestly surprised at how unreliable next auth was at some points. Pretty sure the reason is because I wanted to use the pages router instead of app (just not a huge fan of RSCs/the general direction the framework is headed), combined with a slightly odd schema (where the user is basically just an email row, which connects to a member table with the rest of the user's information — this allowed members to exist on the site without having signed up necessarily, enabling the test data to be visible).
- **Email Validation**: Not sure why but I've been getting a decent amount of errors using Nodemailer to deliver emails over SMTP (not locally, only while hosted). Callback URLs are also pretty unreliable. Very recent development, but part of the reason why I wish I had more control over the authentication flow.