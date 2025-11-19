export default function Comparison() {
  return (
    <section className="py-16">
      <h2 className="text-2xl font-semibold text-center">Why CollabWrite vs Medium & Docs</h2>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left bg-zinc-50">
              <th className="p-3 border border-zinc-200">Tool</th>
              <th className="p-3 border border-zinc-200">Publishing</th>
              <th className="p-3 border border-zinc-200">Editing</th>
              <th className="p-3 border border-zinc-200">AI & Team-first</th>
              <th className="p-3 border border-zinc-200">UX</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border border-zinc-200">Medium</td>
              <td className="p-3 border border-zinc-200">✅</td>
              <td className="p-3 border border-zinc-200">Basic</td>
              <td className="p-3 border border-zinc-200">❌</td>
              <td className="p-3 border border-zinc-200">Clean</td>
            </tr>
            <tr>
              <td className="p-3 border border-zinc-200">Google Docs</td>
              <td className="p-3 border border-zinc-200">Sharing</td>
              <td className="p-3 border border-zinc-200">Generic</td>
              <td className="p-3 border border-zinc-200">Limited</td>
              <td className="p-3 border border-zinc-200">Functional</td>
            </tr>
            <tr className="font-medium">
              <td className="p-3 border border-zinc-200">CollabWrite</td>
              <td className="p-3 border border-zinc-200">Draft → Publish</td>
              <td className="p-3 border border-zinc-200">Real-time + Comments</td>
              <td className="p-3 border border-zinc-200">✅ AI + Team-first</td>
              <td className="p-3 border border-zinc-200">Beautiful & Focused</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
