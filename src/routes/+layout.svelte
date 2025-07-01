<script lang="ts">
  import * as Sidebar from '$lib/components/ui/sidebar/index';
  import * as Breadcrumb from '$lib/components/ui/breadcrumb/index';
  import * as Seperator from '$lib/components/ui/separator/index';
  import AppSidebar from '$lib/components/sidebar.svelte';
  import { page } from '$app/stores';
  import '../app.css';

  let { children } = $props();

  const breadcrumbs = $derived(() => {
    const segments = $page.url.pathname.split('/').filter(Boolean);
    return segments.map((segment) =>
      segment.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    );
  });
</script>

<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset>
    <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <Sidebar.Trigger class="-ml-1" />
      <Seperator.Root orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
      <Breadcrumb.Root>
        <Breadcrumb.List>
          {#if breadcrumbs().length > 0}
            <Breadcrumb.Item class="hidden md:block">
              <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator class="hidden md:block" />
            {#each breadcrumbs() as crumb, index}
              <Breadcrumb.Item>
                {#if index === breadcrumbs().length - 1}
                  <Breadcrumb.Page>{crumb}</Breadcrumb.Page>
                {:else}
                  <Breadcrumb.Link href="#">{crumb}</Breadcrumb.Link>
                {/if}
              </Breadcrumb.Item>
              {#if index < breadcrumbs().length - 1}
                <Breadcrumb.Separator />
              {/if}
            {/each}
          {:else}
            <Breadcrumb.Item>
              <Breadcrumb.Page>Home</Breadcrumb.Page>
            </Breadcrumb.Item>
          {/if}
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </header>
    <main class="p-4">
      {@render children()}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
