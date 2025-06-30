<script lang="ts">
	import HomeIcon from '@lucide/svelte/icons/home';
	import DoorIcon from '@lucide/svelte/icons/door-open';
	import SearchIcon from '@lucide/svelte/icons/search';
	import StarIcon from '@lucide/svelte/icons/star';
	import HeartIcon from '@lucide/svelte/icons/heart';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import BookmarkIcon from '@lucide/svelte/icons/bookmark';
	import UserIcon from '@lucide/svelte/icons/user';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import BarChart3Icon from '@lucide/svelte/icons/bar-chart-3';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { page } from '$app/state';
	import Button from './ui/button/button.svelte';
	import { signIn, signOut } from '@auth/sveltekit/client';

	const mainItems = [
		{
			title: 'Home',
			url: '/',
			icon: HomeIcon
		},
		{
			title: 'Discover',
			url: '/discover',
			icon: SearchIcon
		},
		{
			title: 'AI Recommendations',
			url: '/recommendations',
			icon: SparklesIcon
		},
		{
			title: 'Trending',
			url: '/trending',
			icon: TrendingUpIcon
		}
	];

	const libraryItems = [
		{
			title: 'Favorites',
			url: '/favorites',
			icon: HeartIcon
		},
		{
			title: 'Watchlist',
			url: '/watchlist',
			icon: BookmarkIcon
		},
		{
			title: 'Completed',
			url: '/completed',
			icon: StarIcon
		},
		{
			title: 'Stats',
			url: '/stats',
			icon: BarChart3Icon
		}
	];

	const accountItems = [
		{
			title: 'Profile',
			url: '/profile',
			icon: UserIcon
		},
		{
			title: 'Settings',
			url: '/settings',
			icon: SettingsIcon
		}
	];

	const sidebar = Sidebar.useSidebar();
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Header>
		{#if sidebar.open}
			<a href="/" class="text-muted-foreground mx-auto flex items-center text-2xl">
				<span class="text-primary font-extrabold transition-all hover:rotate-5">Taste</span>Loop
			</a>
		{:else}
			<a href="/" class="text-muted-foreground mx-auto flex items-center text-2xl">
				<span class="text-primary font-extrabold transition-all hover:rotate-10">T</span>L
			</a>
		{/if}
	</Sidebar.Header>
	<Sidebar.Content>
		<!-- Main Navigation -->
		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each mainItems as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>

		<!-- My Library -->
		<Sidebar.Group>
			<Sidebar.GroupLabel>My Library</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each libraryItems as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>

	<!-- Account -->
	<Sidebar.Footer>
		{#if page.data.session}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#if sidebar.open}
						<div class="flex items-center gap-3 rounded-md bg-white/5 p-2">
							<img
								class="w-10 rounded-[50%] transition-all hover:rounded-xl"
								src={page.data.session.user?.image}
								alt="User Avatar"
							/>
							<div class="flex flex-col items-start">
								<p>@{page.data.session.user?.name}</p>
								<p class="text-muted-foreground text-xs">
									{page.data.session.user?.email?.substring(0, 24)}
								</p>
							</div>
						</div>
					{:else}
						<img
							class="w-7 rounded-[50%] transition-all hover:rounded-xl"
							src={page.data.session.user?.image}
							alt="User Avatar"
						/>
					{/if}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					{#each accountItems as item (item.title)}
						<DropdownMenu.Item>
							<a href={item.url} class="flex items-center gap-2 rounded-md p-2">
								<item.icon />
								<span>{item.title}</span>
							</a>
						</DropdownMenu.Item>
					{/each}
					<DropdownMenu.Separator />
					<DropdownMenu.Item>
						<Button onclick={() => void signOut()} class="w-full text-left">Sign Out</Button>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{:else}
			<Button onclick={() => void signIn()} class="w-full">
				<DoorIcon />
				{#if sidebar.open}
					Sign In
				{/if}
			</Button>
		{/if}
	</Sidebar.Footer>
</Sidebar.Root>
