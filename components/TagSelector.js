'use client';
import { useQuery } from '@tanstack/react-query';
import Select from 'react-select';
import { getFirebaseIdToken } from '@/lib/firebaseAuth';

export default function TagSelector({ value, onChange }) {
  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const token = await getFirebaseIdToken();
      const res = await fetch('http://localhost:5000/api/tags', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });

  const options = tags.map(tag => ({
    label: tag.name,
    value: tag._id,
    color: tag.color,
  }));

  return (
    <Select
      isMulti
      value={value}
      onChange={onChange}
      options={options}
      getOptionLabel={e => (
        <div className="flex items-center gap-2">
          <span style={{
            backgroundColor: e.color,
            width: 12,
            height: 12,
            borderRadius: '50%',
            display: 'inline-block'
          }} />
          {e.label}
        </div>
      )}
    />
  );
}
