<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { goto } from '$app/navigation';

  let mainUrl: string = 'https://www.hyperbolic.xyz';
  let companyName: string = '';
  let status: string = '';
  let companyId: number | null = null;

  async function startCrawling() {
    status = 'Starting crawl...'; // Provide immediate feedback
    try {
      const response = await fetch('/api/start-crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mainUrl, companyName })
      });

      if (response.ok) {
        const result = await response.json();
        companyId = result.companyId;
        status = 'Crawling complete!';
      } else {
        const errorText = await response.text();
        status = `Error starting crawl: ${response.status} ${response.statusText} - ${errorText}`;
      }
    } catch (err) {
      if (err instanceof Error) {
        status = 'Network or fetch error: ' + err.message;
      } else {
        status = 'An unknown error occurred';
      }
      console.error('Crawling error:', err); // Log the error for debugging
    }
  }
</script>

<div class="p-4 max-w-md mx-auto">
  <Card.Root>
    <Card.Header>
      <Card.Title>Website Crawler</Card.Title>
      <Card.Description>Enter the URL and start the crawl.</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      <div class="grid w-full items-center gap-1.5">
        <Label for="mainUrl">Main URL</Label>
        <Input id="mainUrl" bind:value={mainUrl} type="text" placeholder="Enter Main URL (e.g., https://example.com)" />
      </div>
      <div class="grid w-full items-center gap-1.5">
        <Label for="companyName">Company Name</Label>
        <Input id="companyName" bind:value={companyName} type="text" placeholder="Enter Company Name" />
      </div>
      {#if status}
        <p class="text-sm text-muted-foreground">Status: {status}</p>
      {/if}
    </Card.Content>
    <Card.Footer class="flex flex-col gap-4">
      <Button on:click={startCrawling} disabled={status === 'Starting crawl...'}>
        {#if status === 'Starting crawl...'}
          Crawling...
        {:else}
          Start Crawling
        {/if}
      </Button>
      {#if status === 'Crawling complete!' && companyId}
        <Button variant="outline" on:click={() => goto(`/companies/${companyId}/scraped-data`)}>
          View Scraped Data
        </Button>
      {/if}
    </Card.Footer>
  </Card.Root>
</div>
