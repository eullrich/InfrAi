# InfrAi - AI Infrastructure Company Insights

InfrAi is a SvelteKit application designed to track and analyze companies in the AI infrastructure space. It scrapes company websites, processes the text content using large language models (LLMs) via the Gemini API, and stores the extracted insights in a Supabase database.

## Features

*   **Web Scraping:** Crawls specified company websites to gather text content. (Leverages external scraping services or APIs - implementation details may vary).
*   **Insight Generation:** Uses Google's Gemini LLM to analyze scraped text and extract key information like mission, services, target audience, pricing, technology, customers, etc.
*   **Supabase Backend:** Stores company data, scraped page content, and generated insights in a PostgreSQL database managed by Supabase.
*   **SvelteKit Frontend:** Provides a user interface to view companies, trigger scraping/processing, and display generated insights.
*   **Admin Interface:** Allows adding new companies and managing the scraping/insight generation process.
*   **Tailwind CSS:** Styled using Tailwind CSS for a modern look and feel.

## Workflow Diagram

```mermaid
graph LR
    A[Admin UI] -- Add Company --> B(Supabase DB);
    B -- Company URL --> C{Scraping Service};
    C -- Scraped Text --> B;
    D[User UI] -- Trigger Insights --> E{API Endpoint: /process-insights};
    E -- Fetch Scraped Text --> B;
    E -- Send Text --> F(Gemini API);
    F -- Generated Insights --> E;
    E -- Store Insights --> B;
    D -- View Insights --> B;

    style A fill:#e9a,stroke-width:2px; /* Admin UI - Pink */
    style D fill:#aae,stroke-width:2px; /* User UI - Blue */
    style B fill:#dda,stroke-width:2px; /* Supabase DB - Yellow */
    style C fill:#eae,stroke-width:2px; /* Scraping Service - Magenta */
    style E fill:#aea,stroke-width:2px; /* API Endpoint - Green */
    style F fill:#eda,stroke-width:2px; /* Gemini API - Orange */
```

## Project Structure

*   `src/routes/`: Contains the application pages and API endpoints.
    *   `+page.svelte`: Homepage displaying the list of companies.
    *   `admin/`: Admin dashboard for managing companies.
    *   `companies/[id]/`: Pages related to specific companies.
        *   `insights/`: Displays the generated insights for a company.
        *   `scraped-data/`: (Potentially) Displays raw scraped data.
    *   `api/`: Server-side API endpoints.
        *   `start-crawl/`: Endpoint to initiate web scraping for a company.
        *   `companies/[id]/process-insights/`: Endpoint to trigger LLM insight generation.
*   `src/lib/`: Contains shared library code.
    *   `components/`: Reusable Svelte components (UI elements).
    *   `supabase-*.ts`: Supabase client initialization and potentially helper functions.
    *   `types.ts`: TypeScript type definitions.
*   `static/`: Static assets.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd InfrAi-Svelte
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    # or npm install or yarn install
    ```
3.  **Environment Variables:**
    *   Create a `.env` file in the project root.
    *   Add your Supabase project URL and anon key:
        ```env
        PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
        PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        ```
    *   Add your Supabase service role key (for server-side operations) and your Google Gemini API key:
        ```env
        SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_KEY
        GOOGLE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
        ```
    *   *(Add any other required environment variables, e.g., for scraping services)*

## Development

Start the development server:

```bash
pnpm run dev

# or open in browser
pnpm run dev -- --open
```

The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

## Building for Production

To create a production version of the app:

```bash
pnpm run build
```

You can preview the production build with `pnpm run preview`.

> **Note:** You might need to install a SvelteKit [adapter](https://kit.svelte.dev/docs/adapters) (e.g., `adapter-node`, `adapter-vercel`) depending on your deployment target. Add it to `svelte.config.js` and install it as a dev dependency.
