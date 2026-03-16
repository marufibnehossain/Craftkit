"use client";

import { useEffect, useState } from "react";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  createdAt: string;
};

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/contact");
        if (res.ok) setMessages(await res.json());
      } catch (_) {}
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="font-sans text-2xl font-semibold text-text mb-4">Contact Messages</h1>
      <div className="border border-border rounded-lg bg-surface overflow-hidden">
        <table className="w-full font-sans text-sm">
          <thead>
            <tr className="border-b border-border bg-sage-1/50">
              <th className="text-left p-3 font-medium text-text">Date</th>
              <th className="text-left p-3 font-medium text-text">Name</th>
              <th className="text-left p-3 font-medium text-text">Email</th>
              <th className="text-left p-3 font-medium text-text">Message</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-6 text-muted text-center">
                  Loading…
                </td>
              </tr>
            ) : messages.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-muted text-center">
                  No contact messages yet
                </td>
              </tr>
            ) : (
              messages.map((msg) => (
                <tr key={msg.id} className="border-b border-border last:border-0">
                  <td className="p-3 text-muted whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 text-text">{msg.name}</td>
                  <td className="p-3 text-text">
                    <a href={`mailto:${msg.email}`} className="text-sage-dark hover:underline">
                      {msg.email}
                    </a>
                  </td>
                  <td className="p-3 text-text max-w-xs truncate" title={msg.message}>
                    {msg.message}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
