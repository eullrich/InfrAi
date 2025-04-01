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
  let selectedPages: number[] = [];

  // Toggle selection of pages
  function toggleSelection(pageId: number) {
    if (selectedPages.includes(pageId)) {
      selectedPages = selectedPages.filter(id => id !== pageId);
    } else {
      selectedPages = [...selectedPages, pageId];
    }
  }

  // Placeholder for LLM processing
  async function processWithLLM() {
    if (selectedPages.length === 0) {
      alert('Please select at least one page');
      return;
    }
    // TODO: Replace this with actual LLM processing logic
    console.log('Selected pages for processing:', selectedPages);
  }
</script>

<h1>Scraped Data for Company ID: {data.companyId}</h1>

{#if data.pages.length > 0}
  <table>
    <thead>
      <tr>
        <th>Select</th>
        <th>URL</th>
        <th>Title</th>
        <th>Parsed Text (Snippet)</th>
      </tr>
    </thead>
    <tbody>
      {#each data.pages as page}
        <tr>
          <td><input type="checkbox" on:change={() => toggleSelection(page.id)} /></td>
          <td>{page.url}</td>
          <td>{page.title}</td>
          <td>{page.parsed_text ? page.parsed_text.substring(0, 100) + '...' : 'No text'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <button on:click={processWithLLM}>Process with LLM</button>
{:else}
  <p>No pages found for this company.</p>
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
