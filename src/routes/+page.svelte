<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
</script>

<div class="p-4 max-w-md mx-auto">
	<Card.Root>
		<Card.Header>
			<Card.Title>Hello World Template</Card.Title>
			<Card.Description>Using shadcn-svelte components</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<p>Hello World!</p>

			<hr class="my-4" />
			<h2 class="text-lg font-semibold">Typography Examples</h2>

			<h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">H1 Heading</h1>
			<h2 class="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
				H2 Heading
			</h2>
			<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">H3 Heading</h3>
			<h4 class="scroll-m-20 text-xl font-semibold tracking-tight">H4 Heading</h4>
			<p class="leading-7 [&:not(:first-child)]:mt-6">
				This is a standard paragraph. The king's name was Solomon and he led the Israelites during
				the golden age of the united monarchy.
			</p>
			<blockquote class="mt-6 border-l-2 pl-6 italic">
				"This is a blockquote. After all," he said, "everyone enjoys a good joke, so it's only fair
				that they should pay for the privilege."
			</blockquote>
			<ul class="my-6 ml-6 list-disc [&>li]:mt-2">
				<li>Unordered List Item 1</li>
				<li>Unordered List Item 2</li>
			</ul>
			<ol class="my-6 ml-6 list-decimal [&>li]:mt-2">
				<li>Ordered List Item 1</li>
				<li>Ordered List Item 2</li>
			</ol>
			<p class="text-sm font-medium leading-none">
				Inline code example: Use <code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">`code`</code> tags.
			</p>
			<pre class="mt-6 overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-sm">
<code class="language-javascript">function greet(name) {'{'}
  console.log(`Hello, ${'{'}name{'}'}!`);
{'}'}</code></pre>
			<p class="text-xl text-muted-foreground">Lead text: A modal dialog that interrupts the user with important content and expects a response.</p>
			<div class="text-lg font-semibold">Large text: Are you sure absolutely sure?</div>
			<small class="text-sm font-medium leading-none">Small text: Email Address</small>
			<p class="text-sm text-muted-foreground">Muted text: Enter your email address.</p>

			<hr class="my-4" />

			<div class="grid w-full max-w-sm items-center gap-1.5">
				<Label for="name">Name</Label>
				<Input id="name" placeholder="Enter your name" />
			</div>
			<div class="grid w-full max-w-sm items-center gap-1.5">
				<Label for="framework">Framework</Label>
				<Select.Root>
					<Select.Trigger class="w-full">
						<Select.Value placeholder="Select a framework" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="sveltekit">SvelteKit</Select.Item>
						<Select.Item value="next">Next.js</Select.Item>
						<Select.Item value="nuxt">Nuxt.js</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</Card.Content>
		<Card.Footer>
			<Button>Submit</Button>
		</Card.Footer>
	</Card.Root>
</div>
