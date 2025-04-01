<script lang="ts">
  interface Page {
    id: number;
    url: string;
    title: string;
    parsed_text: string | null;
  }

  interface PageData {
    companyId: string;
    pages: Page[];
  }

  export let data: PageData;
  let isLoading = false;
  let statusMessage = '';

  // Function to trigger the backend insight generation
  async function generateInsights() {
    isLoading = true;
    statusMessage = 'Generating insights...';

    try {
      const response = await fetch(`/api/companies/${data.companyId}/process-insights`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      statusMessage = result.message || 'Insights generated successfully!';
      alert(statusMessage); // Simple feedback

      // Optionally redirect or update UI
      // window.location.href = `/companies/${data.companyId}/insights`;

    } catch (error: any) {
      console.error('Error generating insights:', error);
      statusMessage = `Error: ${error.message}`;
      alert(statusMessage); // Simple feedback
    } finally {
      isLoading = false;
    }
  }
</script>

<h1>Scraped Data for Company ID: {data.companyId}</h1>

<nav>
  <a href="/companies/{data.companyId}/scraped-data">Scraped Data</a> |
  <a href="/companies/{data.companyId}/insights">View Insights</a>
</nav>

{#if data.pages.length > 0}
  <button on:click={generateInsights} disabled={isLoading}>
    {isLoading ? 'Processing...' : 'Generate Company Insights'}
  </button>
  {#if statusMessage}<p>{statusMessage}</p>{/if}

  <hr style="margin: 20px 0;" />
  <h2>Raw Scraped Pages</h2>
  <table>
    <thead>
      <tr>
        <th>URL</th>
        <th>Title</th>
        <th>Parsed Text (Snippet)</th>
      </tr>
    </thead>
    <tbody>
      {#each data.pages as page}
        <tr>
          <td><a href={page.url} target="_blank" rel="noopener noreferrer">{page.url}</a></td>
          <td>{page.title || '(No title)'}</td>
          <td>{page.parsed_text ? page.parsed_text.substring(0, 150) + '...' : 'No text'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{:else}
  <p>No pages found for this company.</p>
  <button on:click={generateInsights} disabled={isLoading}>
    {isLoading ? 'Processing...' : 'Attempt Insight Generation (No Pages Found)'}
  </button>
  {#if statusMessage}<p>{statusMessage}</p>{/if}
{/if}

<style>
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  th {
    background-color: #f2f2f2;
  }
  button {
    margin-top: 10px;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
  }
  button:hover {
    background-color: #0056b3;
  }
</style>
