import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChangeList from '@/components/changes/ChangeList';

const ChangesPage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Optionally update the URL with the page number
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page },
    }, undefined, { shallow: true });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Change Requests</h1>
        <Button
          onClick={() => router.push('/changes/new')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          New Change Request
        </Button>
      </div>
      <ChangeList 
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ChangesPage;