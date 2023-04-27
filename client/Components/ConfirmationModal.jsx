/* eslint-disable react/prop-types */
import React from 'react';
import { useData } from '../Providers/DataProvider';

function ConfirmationModal({ setShow, deleteName, handleDeleteFolder }) {
  const { folders } = useData();

  const handleDelete = () => {
    handleDeleteFolder(folders[deleteName]);
    setShow(false);
  };

  const handleClose = () => {
    setShow(false);
  };

  return (
    <div className='flex items-center justify-center fixed top-[40%] left-[35%] z-[10000] '>
      <div className='bg-white rounded-md shadow-md p-6 text-center flex flex-col items-center justify-center'>
        <p className='p-5'>
          <span className='text-red-500 text-2xl relative top-1'>&#x26A0;</span>{' '}
          Deleting{' '}
          <strong className='text-blue-800'>&quot;{deleteName}&quot;</strong>{' '}
          will remove{' '}
          <strong>
            <span className='underline'>all snips inside.</span>
          </strong>
        </p>

        <div className='flex justify-end'>
          <button
            className='bg-gray-300 text-black hover:bg-gray-400 rounded-md px-4 py-2 mr-2'
            onClick={handleClose}
            type='button'
          >
            Cancel
          </button>
          <button
            className='bg-red-500 hover:bg-red-400 text-white rounded-md px-4 py-2'
            onClick={handleDelete}
            type='button'
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
