import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import { useEffect } from 'react';
import { useProjectContext } from '@/context/ProjectContext';
import { EmptyState } from '@/components/shared/EmptyState';

interface Props {
  title: string;
  message?: string;
}

const PlaceholderPage = ({ title, message }: Props) => {
  const { id } = useParams();
  const { setActiveProjectId } = useProjectContext();
  useEffect(() => {
    if (id) setActiveProjectId(id);
  }, [id, setActiveProjectId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="px-6 py-12"
    >
      <EmptyState
        icon={Construction}
        title={title}
        message={message ?? 'Coming soon. We\'re building this out.'}
      />
    </motion.div>
  );
};

export default PlaceholderPage;
