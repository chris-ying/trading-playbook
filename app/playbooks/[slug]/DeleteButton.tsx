"use client";

import { deletePlaybook } from "./actions";

type Props = {
  slug: string;
};

export default function DeleteButton({ slug }: Props) {
  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this playbook?"
    );

    if (!confirmed) return;

    await deletePlaybook(slug);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
    >
      Delete Playbook
    </button>
  );
}
