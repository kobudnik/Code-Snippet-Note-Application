import React, { useCallback, useState } from 'react';
import { useData } from '../Providers/DataProvider';
import { useParams } from 'react-router-dom';

const Actions = () => {
  const { usePostFolder, useFiltered, selectedSnips, setPosts, folders } =
    useData();
  const [action, setAction] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [newFolder, setNewFolder] = useState('');

  const handleActionChange = useCallback((event) => {
    setAction(event.target.value);
  });

  const handleSelectedFolder = (event) => {
    const selected =
      event.target.value === 'Home' ? 'default' : event.target.value;
    setSelectedFolder(selected);
  };

  const handleDeletedSnips = useCallback(async () => {
    try {
      const requestOptions = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snipIDs: selectedSnips }),
      };
      const deleteSnips = await fetch('/api/snipped', requestOptions);
      if (!deleteSnips.ok) {
        throw { message: 'Unable to delete snippets' };
      }
      const updatedList = await deleteSnips.json();
      setPosts(updatedList);
    } catch (e) {
      console.log('error deleting snippets in texteditor', e.message);
    }
  }, [selectedSnips]);

  const handleMoveSnips = useCallback(
    async (selectedName) => {
      try {
        const requestOptions = {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            snipIDs: selectedSnips,
            newFolderID: folders[selectedName],
            folderID: folders[currentFolder],
          }),
        };
        const moveSnips = await fetch('/api/snipped', requestOptions);
        if (!moveSnips.ok) {
          throw { message: 'Unable to move snippets' };
        }
        const updatedList = await moveSnips.json();
        setPosts(updatedList);
      } catch (e) {
        console.log('error moving snippets to new folder', e.message);
      }
    },
    [selectedSnips, folders, currentFolder],
  );

  const { currentFolder } = useParams();

  const postMethods = {
    ADD: () => {
      usePostFolder(newFolder);
      setAction('');
    },
    DELETE: () => {
      handleDeletedSnips(selectedSnips);
      setAction('');
    },

    MOVE: (e) => {
      handleMoveSnips(selectedFolder);
      setAction('');
      setSelectedFolder('');
    },
  };

  const handleFocus = useCallback((e) => {
    e.target.placeholder = '';
  });

  const handleBlur = useCallback((e) => {
    e.target.placeholder = e.target.name;
  });

  const handleFolderChange = useCallback((e) => {
    setNewFolder(e.target.value);
  });

  const folderInput = (
    <input
      type='text'
      placeholder='folder name'
      className='rounded-3xl py-3 w-48 text-center outline-none'
      aria-label='login-username-input'
      name='folderName'
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleFolderChange}
      value={newFolder}
    />
  );

  const availableFolders = useFiltered(currentFolder);

  const folderSelect = (
    <>
      <label
        htmlFor='folder-selector'
        className='block font-medium text-yellow-500'
      >
        Select a folder:
      </label>
      <select
        id='folder-selector'
        className='focus:outline-none text-lg bg-gray-50 text-center border border-gray-300 text-gray-900 rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white '
        onChange={handleSelectedFolder}
        value={selectedFolder}
      >
        <option value=''>Choose from below</option>
        {availableFolders.length > 0 &&
          availableFolders.map((folderName, i) => {
            return (
              <option
                value={folderName}
                id={folders[folderName]}
                key={folders[folderName]}
              >
                {folderName}
              </option>
            );
          })}
      </select>
    </>
  );

  const submitButton = (
    <button
      data-te-ripple-init
      data-te-ripple-color='light'
      className='w-40 px-6 block
py-4 text-sm font-medium text-center rounded text-white bg-green-800
hover:bg-green-700 mt-4'
      onClick={() => postMethods[action]()}
    >
      Submit
    </button>
  );

  return (
    <div className='right-24 fixed top-1/4'>
      <div className='flex flex-col items-center'>
        <select
          id='action-selector'
          className='focus:outline-none mb-4 text-lg bg-gray-50 text-center border border-gray-300 text-gray-900 rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white '
          onChange={handleActionChange}
          value={action}
        >
          <option value=''>Select an option</option>
          <option value='ADD'>Create Folder</option>
          <option value='MOVE'>Move snippet</option>
          <option value='DELETE'>Delete snippet</option>
        </select>
        <div>
          {action === 'ADD' && folderInput}

          {action === 'MOVE' && folderSelect}
        </div>
        {action && submitButton}
      </div>
    </div>
  );
};

export default Actions;
