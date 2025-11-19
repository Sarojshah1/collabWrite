import Image from "next/image";

type ProfileCardProps = {
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
  coverUrl?: string;
  stats?: {
    posts?: number;
    followers?: number;
    following?: number;
  };
  skills?: string[];
  location?: string;
  website?: string;
};

export default function ProfileCard({
  name,
  username,
  bio,
  avatarUrl,
  coverUrl = "/cover.jpg",
  stats = { posts: 0, followers: 0, following: 0 },
  skills = [],
  location,
  website,
}: ProfileCardProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {coverUrl && (
        <div className="h-40 w-full overflow-hidden bg-zinc-100">
          <Image src={coverUrl} alt="cover" width={1200} height={320} className="h-40 w-full object-cover" />
        </div>
      )}

      <div className="px-6 pb-6">
        <div className="-mt-10 flex items-end gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl ring-2 ring-white">
            <Image src={avatarUrl} alt={name} width={160} height={160} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-zinc-900">{name}</h1>
            <p className="text-sm text-zinc-500">@{username}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-100"
            >
              Message
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Follow
            </a>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-[15px] leading-6 text-zinc-700">{bio}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
          {location && <span className="rounded-full bg-zinc-100 px-3 py-1 ring-1 ring-inset ring-zinc-200">{location}</span>}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-200"
            >
              {website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>

        <div className="mt-6 grid grid-cols-3 divide-x divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200">
          <div className="bg-white p-4 text-center">
            <div className="text-2xl font-semibold text-zinc-900">{stats.posts ?? 0}</div>
            <div className="text-xs uppercase tracking-wide text-zinc-500">Posts</div>
          </div>
          <div className="bg-white p-4 text-center">
            <div className="text-2xl font-semibold text-zinc-900">{stats.followers ?? 0}</div>
            <div className="text-xs uppercase tracking-wide text-zinc-500">Followers</div>
          </div>
          <div className="bg-white p-4 text-center">
            <div className="text-2xl font-semibold text-zinc-900">{stats.following ?? 0}</div>
            <div className="text-xs uppercase tracking-wide text-zinc-500">Following</div>
          </div>
        </div>

        {skills.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-medium text-zinc-700">Skills</h2>
            <div className="flex flex-wrap gap-2 text-sm">
              {skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700 ring-1 ring-inset ring-zinc-200"
                >
                  #{s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
