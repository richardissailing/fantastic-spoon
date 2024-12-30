import { useEffect } from 'react';
import { useRouter } from 'next/router';

const ChangesIndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/changes/list');
  }, [router]);

  return null;
};

export default ChangesIndexPage;
