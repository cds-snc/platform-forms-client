# TreeView Store Synchronization

## Overview

The updated TreeView component now properly syncs with your external store (useGroupStore) and maintains state consistency. Here's how it works:

## Key Features

### 1. **Bidirectional State Sync**
- **Store → Tree**: When data changes in your store, the tree automatically rebuilds
- **Tree → Store**: When users interact with the tree (select, drag & drop), changes are reflected in the store

### 2. **State Preservation**
- Expanded items are preserved during rebuilds
- Selected items are maintained when data changes
- User interactions don't get lost during updates

### 3. **Efficient Updates**
- Only rebuilds when actual data changes (using changeKey)
- Prevents unnecessary re-renders
- Maintains performance with large datasets

## How It Works

### Store Integration
```typescript
// The TreeView automatically subscribes to these store changes:
const { getTreeData, updateGroup, setSelectedElementId, selectedElementId } = useGroupStore((s) => ({
  getTreeData: s.getTreeData,           // Provides tree data
  updateGroup: s.updateGroup,           // Handles drag & drop updates
  setSelectedElementId: s.setSelectedElementId,  // Updates selection in store
  selectedElementId: s.selectedElementId,        // Current selection from store
}));
```

### Data Flow

1. **Initial Load**:
   ```typescript
   // Tree gets initial data from store
   dataLoader: {
     getItem: (itemId: string) => {
       const items = getTreeData(treeOptions);
       return items[itemId];
     },
     getChildren: (itemId: string) => {
       const items = getTreeData(treeOptions);
       return items[itemId]?.children || [];
     }
   }
   ```

2. **User Interactions**:
   ```typescript
   // Drag & Drop
   onDrop: createOnDropHandler((item, newChildren) => {
     updateGroup(item.getId(), newChildren);  // Updates store
   }),

   // Selection
   onSelectItems: (items) => {
     const elementId = getSelectedElementId(items);
     if (elementId !== undefined) {
       setSelectedElementId(elementId);  // Updates store
     }
   }
   ```

3. **Store Changes**:
   ```typescript
   // useTreeSync hook listens for store changes
   useEffect(() => {
     const unsubscribe = templateStore.subscribe((state) => {
       if (state.changeKey !== previousChangeKey.current) {
         // Preserve current state
         const currentState = tree.getState();
         
         // Rebuild with preserved state
         tree.rebuildTree().then(() => {
           tree.setExpandedItems(currentState.expandedItems);
           tree.setSelectedItems(currentState.selectedItems);
         });
       }
     });
   }, [tree, templateStore]);
   ```

## Usage Example

```typescript
// In your component
import { TreeView } from './TreeView';

const MyFormBuilder = () => {
  const treeRef = useRef();

  const handleAddItem = (id: string) => {
    // Update your store (this will automatically sync with tree)
    addElementToGroup(id);
    
    // Optional: manually trigger rebuild if needed
    treeRef.current?.addItem();
  };

  return (
    <div>
      <TreeView
        ref={treeRef}
        addItem={handleAddItem}
        updateItem={(id, value) => updateElementInStore(id, value)}
        removeItem={(id) => removeElementFromStore(id)}
        addPage={() => addPageToStore()}
        refresh={() => refreshStore()}
      />
    </div>
  );
};
```

## Benefits

1. **Simplified State Management**: No need to manually sync tree state with your store
2. **Automatic Updates**: Changes in your store automatically reflect in the tree
3. **User Experience**: Selections and expanded state are preserved during updates
4. **Performance**: Efficient updates only when data actually changes
5. **Consistency**: Single source of truth (your store) for all data

## Troubleshooting

### Tree Not Updating
- Ensure your store is calling `setChangeKey()` when data changes
- Check that `getTreeData()` returns updated data
- Verify the template store subscription is working

### Selection Not Syncing
- Make sure `selectedElementId` is properly set in your store
- Check that element IDs are correctly converted between string/number formats
- Verify `setSelectedElementId` is being called

### Performance Issues
- The tree only rebuilds when `changeKey` changes
- Use `tree.rebuildTree()` sparingly in imperative handle methods
- Consider debouncing rapid store updates if needed

This implementation follows the headless-tree documentation patterns for external data sources while providing seamless integration with your existing Zustand store architecture.
