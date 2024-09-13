import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../Providers/DataProvider';
import { sleep } from '../utils/sleep';

function Actions() {
  const {
    useFiltered,
    selectedSnips,
    setPosts,
    setFolders,
    folders,
    updatedSnip,
    setUpdatedSnip,
  } = useData();

  const navigateTo = useNavigate();
  const [action, setAction] = useState('');
  const [actionStatus, setActionStatus] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [newFolder, setNewFolder] = useState('');

  const handleActionChange = (event) => {
    setAction(event.target.value);
  };

  const handlePostFolder = useCallback(
    async (folderName) => {
      try {
        const parsedName = folderName.replace(/[?]/g, '').trim();
        if (
          parsedName in folders ||
          parsedName === 'Home' ||
          parsedName === 'default'
        ) {
          throw new Error('Folder already exists');
        }
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folderName: parsedName }),
        };
        const postFolder = await fetch('/api/folders', requestOptions);

        if (!postFolder.ok) throw new Error('An error occurred');

        const { name, id } = await postFolder.json();
        setFolders((prev) => ({ ...prev, [name]: id }));
        setActionStatus('Success!');
        await sleep(0);
        navigateTo(`/${parsedName}`);
      } catch (e) {
        setActionStatus(e.message);
      }
    },
    [folders, setFolders, navigateTo],
  );

  const handleSelectedFolder = (event) => {
    const selected = event.target.value;
    setSelectedFolder(selected);
  };

  const handleDeletedSnips = async () => {
    try {
      if (!selectedSnips.length) throw new Error('Please select snippets');
      const requestOptions = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snipIDs: selectedSnips }),
      };
      const deleteSnips = await fetch('/api/snipped', requestOptions);
      if (!deleteSnips.ok) throw new Error('An error occurred.');

      const updatedList = await deleteSnips.json();
      setPosts(updatedList);
      setActionStatus('Success!');
    } catch (e) {
      setActionStatus(e.message);
    }
  };

  const { currentFolder } = useParams();

  const handleMoveSnips = useCallback(
    async (selectedName) => {
      try {
        if (!selectedSnips.length) throw new Error('Please select snippets');
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
        if (!moveSnips.ok) throw new Error('An error occurred');
        const updatedList = await moveSnips.json();
        setPosts(updatedList);
        setActionStatus('Success!');
      } catch (e) {
        setActionStatus(e.message);
      }
    },
    [selectedSnips, folders, currentFolder, setPosts],
  );

  const handleUpdatedSnips = useCallback(
    async (snip) => {
      try {
        if (!selectedSnips.length > 0)
          throw new Error('Please select a snippet');

        if (selectedSnips.length > 1)
          throw new Error('Select only last modified');
        if (updatedSnip.length < 4) throw new Error('Minimum 4 new chars');
        const requestOptions = {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            snipID: snip,
            folderID: folders[currentFolder],
            newSnip: updatedSnip,
          }),
        };

        const updateSnip = await fetch('/api/snipped', requestOptions);
        if (!updateSnip.ok) throw new Error('An error occurred.');
        const updatedList = await updateSnip.json();
        setPosts(updatedList);
        setActionStatus('Success!');
        setUpdatedSnip('');
      } catch (e) {
        setActionStatus(e.message);
      }
    },
    [
      selectedSnips.length,
      updatedSnip,
      folders,
      currentFolder,
      setPosts,
      setUpdatedSnip,
    ],
  );

  const handleFocus = (e) => {
    e.target.placeholder = '';
  };

  const handleBlur = (e) => {
    e.target.placeholder = e.target.name;
  };

  const handleFolderChange = (e) => {
    setNewFolder(e.target.value);
  };

  const postMethods = {
    ADD: () => {
      handlePostFolder(newFolder);
      setAction('');
      setNewFolder('');
    },
    DELETE: () => {
      handleDeletedSnips(selectedSnips);
      setAction('');
    },

    MOVE: () => {
      handleMoveSnips(selectedFolder);
      setAction('');
      setSelectedFolder('');
    },
    UPDATE: () => {
      handleUpdatedSnips(selectedSnips[0]);
      setAction('');
    },
  };

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
    <label
      htmlFor='folder-selector'
      className='block font-medium text-yellow-500'
    >
      Select a folder:
      <div />
      <select
        id='folder-selector'
        className='focus:outline-none text-lg bg-gray-50 text-center border border-gray-300 text-gray-900 rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white '
        onChange={handleSelectedFolder}
        value={selectedFolder}
      >
        <option value=''>Choose from below</option>
        {availableFolders.map((folderName) => {
          return (
            <option
              value={folderName}
              id={folders[folderName]}
              key={folders[folderName]}
            >
              {folderName === 'home' ? 'Home' : folderName}
            </option>
          );
        })}
      </select>
    </label>
  );

  const submitButton = (
    <button
      type='button'
      data-te-ripple-init
      data-te-ripple-color='light'
      className={`w-40 px-6 block py-4 text-sm font-medium text-center rounded text-white ${
        action === 'DELETE'
          ? 'bg-red-600 hover:bg-red-500'
          : 'bg-green-700 hover:bg-green-600'
      } mt-4`}
      onClick={() => postMethods[action]()}
    >
      {action}
    </button>
  );

  useEffect(() => {
    let timeoutId;
    if (actionStatus) {
      timeoutId = setTimeout(() => {
        setActionStatus('');
      }, 2000);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [actionStatus]);

  return (
    <div className='right-16 fixed top-1/4'>
      <div className='flex flex-col items-center'>
        <select
          id='action-selector'
          className='focus:outline-none mb-4 text-lg bg-gray-50 text-center border border-gray-300 text-gray-900 rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white '
          onChange={handleActionChange}
          value={action}
        >
          <option value=''>Select an option</option>
          <option value='ADD'>Create folder</option>
          {selectedSnips.length > 0 && (
            <>
              {Object.keys(folders).length > 1 && (
                <option value='MOVE'>Move snippet</option>
              )}
              <option value='DELETE'>Delete snippet</option>
              <option value='UPDATE'>Update snippet</option>
            </>
          )}
        </select>
        <div>
          {action === 'ADD' && folderInput}

          {action === 'MOVE' && folderSelect}
        </div>
        {action && submitButton}
        <i
          className={`${
            actionStatus === 'Success!'
              ? 'text-green-800 text-2xl'
              : 'text-red-700 text-xl'
          }  text-center font-extrabold `}
        >
          {actionStatus}
        </i>
      </div>
    </div>
  );
}

export default Actions;
