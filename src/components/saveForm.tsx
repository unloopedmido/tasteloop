import type { NextPage } from 'next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { api } from '@/utils/api';
import { Bookmark, CircleX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog';
import type { Anime } from '@/types/anime';
import { useState } from 'react';

interface SaveDialogProps {
  anime: Anime;
}

const WatchlistDialog: NextPage<SaveDialogProps> = ({ anime }: SaveDialogProps) => {
  const [selectedAnimeId, setSelectedAnimeId] = useState<number | null>(null);

  const {
    data: userAnimes,
    refetch: refetchUserAnimes,
    isLoading: userAnimesLoading
  } = api.anime.userAnimes.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  const {
    mutate: removeFromWatchlist,
    error,
    isPending: removing
  } = api.anime.remove.useMutation({
    onSuccess: () => {
      void refetchUserAnimes();
    }
  });

  const inWatchList = userAnimes?.some((userAnime) => userAnime.malId === anime.mal_id);

  return (
    <Dialog
      open={selectedAnimeId === anime.mal_id}
      onOpenChange={(open) => {
        if (!open) setSelectedAnimeId(null);
      }}
    >
      {!inWatchList && !userAnimesLoading ? (
        <DialogTrigger asChild>
          <Button
            disabled={userAnimesLoading}
            variant="default"
            className="gap-2"
            onClick={() => setSelectedAnimeId(anime.mal_id)}
          >
            <Bookmark size={16} />
            Add to Watchlist
          </Button>
        </DialogTrigger>
      ) : (
        <Button
          variant="outline"
          disabled={removing || userAnimesLoading}
          onClick={async () => removeFromWatchlist({ malId: anime.mal_id })}
        >
          {removing ? (
            'Removing...'
          ) : (
            <>
              <Bookmark />
              Remove from Watchlist
            </>
          )}
        </Button>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Watchlist</DialogTitle>
          <DialogDescription>
            Select the start and end dates for your watchlist entry.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-red-950 p-4">
            <CircleX className="text-red-500" />
            <p className="text-sm">{error.message}</p>
          </div>
        )}
        <SaveForm
          total_eps={anime.episodes}
          refetch={refetchUserAnimes}
          closeDialog={() => setSelectedAnimeId(null)}
          malId={anime.mal_id}
        />
      </DialogContent>
    </Dialog>
  );
};

interface SaveFormProps {
  malId: number;
  total_eps?: number;
  closeDialog: () => void;
  refetch: () => void;
}

const SaveForm: NextPage<SaveFormProps> = ({ malId, closeDialog, refetch, total_eps }) => {
  const saveSchema = z.object({
    status: z.enum(['WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLANNING']).default('PLANNING'),
    eps_watched: z
      .number()
      .int()
      .max(total_eps ?? 1000)
      .optional()
      .default(0),
    score: z.number().int().min(1).max(10)
  });

  type SaveValues = z.infer<typeof saveSchema>;
  type SaveInput = z.input<typeof saveSchema>;

  const form = useForm<SaveInput, unknown, SaveValues>({
    resolver: zodResolver(saveSchema),
    defaultValues: {
      status: 'PLANNING',
      eps_watched: 0,
      score: 5
    }
  });

  const {
    mutate: saveAnime,
    isPending: savingAnime,
    error
  } = api.anime.save.useMutation({
    onSuccess: () => {
      form.reset();
      closeDialog();
      refetch();
    }
  });

  function onSubmit(values: SaveValues) {
    saveAnime({
      ...values,
      malId
    });
  }

  return (
    <Form {...form}>
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-950 p-4">
          <CircleX className="text-red-500" />
          <p className="text-sm">{error.message}</p>
        </div>
      )}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" name="mal_id" value={malId} />
        <FormField
          control={form.control}
          name="score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Score</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="8"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value}
                />
              </FormControl>
              <FormDescription>Rate the anime from 1 to 10.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="eps_watched"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Episodes Watched</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="20"
                  {...field}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                    if (Number(e.target.value) > 0) {
                      form.setValue('status', 'WATCHING');
                    }
                  }}
                  value={field.value}
                />
              </FormControl>
              <FormDescription>
                Enter the amount of episodes you already watched (out of {total_eps}).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  switch (value) {
                    case 'COMPLETED':
                      form.setValue('eps_watched', total_eps ?? 0);
                      break;
                    case 'PLANNING':
                      form.setValue('eps_watched', 0);
                      break;
                  }
                }}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="WATCHING">Watching</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="DROPPED">Dropped</SelectItem>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Select the current status of the anime</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={savingAnime} type="submit">
          {savingAnime ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Form>
  );
};

export default WatchlistDialog;
