import { colorFromId, initials } from '@/utils/colors';
import type { User } from '@/types';

interface Props {
  user?: User;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const SIZE = {
  sm: { box: 'w-6 h-6', text: 'text-[10px]' },
  md: { box: 'w-8 h-8', text: 'text-xs' },
  lg: { box: 'w-10 h-10', text: 'text-sm' },
};

export const UserAvatar = ({ user, size = 'md', showTooltip }: Props) => {
  if (!user) {
    return (
      <div
        className={`${SIZE[size].box} rounded-full bg-slate-700 text-slate-500 flex items-center justify-center ${SIZE[size].text}`}
      >
        ?
      </div>
    );
  }
  const bg = colorFromId(user.id);
  return (
    <div
      title={showTooltip ? user.name : undefined}
      className={`${SIZE[size].box} ${bg} text-white font-semibold rounded-full flex items-center justify-center ${SIZE[size].text} ring-1 ring-black/10`}
    >
      {initials(user.name)}
    </div>
  );
};
