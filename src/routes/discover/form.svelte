<script lang="ts">
  import * as Form from '$lib/components/ui/form';
  import * as Select from '$lib/components/ui/select';
  import { Input } from '$lib/components/ui/input';
  import { saveSchema, type SaveSchema } from './schema';
  import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { enhance } from '$app/forms';

  let { data, malId }: { data: { form: SuperValidated<Infer<SaveSchema>> }; malId: number } =
    $props();

  const form = superForm(data.form, {
    validators: zodClient(saveSchema)
  });

  const { form: formData, errors } = form;
</script>

<form method="POST" use:enhance>
  <Form.Field {form} name="malId">
    <Form.Control>
      {#snippet children({ props })}
        <input type="hidden" {...props} bind:value={malId} />
      {/snippet}
    </Form.Control>
  </Form.Field>
  <Form.Field {form} name="score">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Your Score</Form.Label>
        <Input type="number" {...props} bind:value={$formData.score} />
      {/snippet}
    </Form.Control>
    <Form.Description>How do you rate this anime out of 10.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="status">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Status</Form.Label>
        <Select.Root name={props.name} bind:value={$formData.status} type="single">
          <Select.Trigger {...props}>
            {$formData.status || 'Select Status'}
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="WATCHING" label="Watching" />
            <Select.Item value="COMPLETED" label="Completed" />
            <Select.Item value="ON_HOLD" label="Paused" />
            <Select.Item value="DROPPED" label="Dropped" />
            <Select.Item value="PLANNING" label="Planning" />
          </Select.Content>
        </Select.Root>
      {/snippet}
    </Form.Control>
    <Form.Description>Select the current status of your watchlist entry.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="startDate">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Start Date</Form.Label>
        <Input type="date" {...props} bind:value={$formData.startDate} placeholder="YYYY-MM-DD" />
      {/snippet}
    </Form.Control>
    <Form.Description>Select the date you started this anime.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="endDate">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>End Date</Form.Label>
        <Input type="date" {...props} bind:value={$formData.endDate} placeholder="YYYY-MM-DD" />
      {/snippet}
    </Form.Control>
    <Form.Description>Select the date you finished this anime.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="eps_watched">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Episodes Watched</Form.Label>
        <Input type="number" {...props} bind:value={$formData.eps_watched} />
      {/snippet}
    </Form.Control>
    <Form.Description>How many episodes did you watch.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Button type="submit">Submit</Form.Button>
</form>
