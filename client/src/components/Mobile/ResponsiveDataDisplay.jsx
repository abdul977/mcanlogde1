import React from 'react';
import { FaEye, FaEdit, FaTrash, FaList, FaTh, FaTable } from 'react-icons/fa';
import { useMobileResponsive, useResponsiveView } from '../../hooks/useMobileResponsive.jsx';
import { MobileButton } from './MobileLayout';

/**
 * Universal Responsive Data Display Component
 * Automatically switches between table, grid, and card views based on screen size
 */
export const ResponsiveDataDisplay = ({
  data = [],
  columns = [],
  loading = false,
  error = null,
  emptyMessage = 'No data available',
  emptyIcon: EmptyIcon,
  onView,
  onEdit,
  onDelete,
  cardComponent: CardComponent,
  tableComponent: TableComponent,
  gridComponent: GridComponent,
  showViewToggle = true,
  defaultView = 'auto', // 'auto', 'card', 'grid', 'table'
}) => {
  const { isMobile, isTablet } = useMobileResponsive();
  const { viewMode, setViewMode, toggleView, isCardView, isGridView, isTableView } = useResponsiveView(defaultView);

  // Auto-determine view mode if set to 'auto'
  const getEffectiveViewMode = () => {
    if (defaultView === 'auto') {
      if (isMobile) return 'card';
      if (isTablet) return 'grid';
      return 'table';
    }
    return viewMode;
  };

  const effectiveViewMode = getEffectiveViewMode();

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mcan-primary"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        {EmptyIcon && <EmptyIcon className="mx-auto text-4xl text-gray-400 mb-4" />}
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Found</h3>
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* View Toggle Header */}
      {showViewToggle && !isMobile && (
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {data.length} item{data.length !== 1 ? 's' : ''}
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded ${
                effectiveViewMode === 'card'
                  ? 'bg-mcan-primary text-white'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Card View"
            >
              <FaList />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                effectiveViewMode === 'grid'
                  ? 'bg-mcan-primary text-white'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Grid View"
            >
              <FaTh />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded ${
                effectiveViewMode === 'table'
                  ? 'bg-mcan-primary text-white'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Table View"
            >
              <FaTable />
            </button>
          </div>
        </div>
      )}

      {/* Data Display */}
      <div className="p-4">
        {effectiveViewMode === 'card' && (
          <CardView
            data={data}
            columns={columns}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            CardComponent={CardComponent}
          />
        )}
        {effectiveViewMode === 'grid' && (
          <GridView
            data={data}
            columns={columns}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            GridComponent={GridComponent}
          />
        )}
        {effectiveViewMode === 'table' && (
          <TableView
            data={data}
            columns={columns}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            TableComponent={TableComponent}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Card View Component
 */
const CardView = ({ data, columns, onView, onEdit, onDelete, CardComponent }) => {
  if (CardComponent) {
    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <CardComponent
            key={item.id || item._id || index}
            item={item}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <DefaultCard
          key={item.id || item._id || index}
          item={item}
          columns={columns}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

/**
 * Grid View Component
 */
const GridView = ({ data, columns, onView, onEdit, onDelete, GridComponent }) => {
  const { getResponsiveColumns } = useMobileResponsive();
  const gridCols = getResponsiveColumns(1, 2, 3);

  if (GridComponent) {
    return (
      <div className={`grid grid-cols-${gridCols} gap-4`}>
        {data.map((item, index) => (
          <GridComponent
            key={item.id || item._id || index}
            item={item}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
      {data.map((item, index) => (
        <DefaultGridCard
          key={item.id || item._id || index}
          item={item}
          columns={columns}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

/**
 * Table View Component
 */
const TableView = ({ data, columns, onView, onEdit, onDelete, TableComponent }) => {
  if (TableComponent) {
    return <TableComponent data={data} columns={columns} onView={onView} onEdit={onEdit} onDelete={onDelete} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header || column.key}
              </th>
            ))}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={item.id || item._id || index} className="hover:bg-gray-50">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render ? column.render(item, item[column.key]) : item[column.key]}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <ActionButtons item={item} onView={onView} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Default Card Component
 */
const DefaultCard = ({ item, columns, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="space-y-2">
        {columns.slice(0, 4).map((column, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">{column.header || column.key}:</span>
            <span className="text-sm text-gray-900">
              {column.render ? column.render(item, item[column.key]) : item[column.key]}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <ActionButtons item={item} onView={onView} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
};

/**
 * Default Grid Card Component
 */
const DefaultGridCard = ({ item, columns, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      <div className="space-y-3">
        {columns.slice(0, 3).map((column, index) => (
          <div key={index}>
            <div className="text-xs font-medium text-gray-500 uppercase">{column.header || column.key}</div>
            <div className="text-sm text-gray-900 mt-1">
              {column.render ? column.render(item, item[column.key]) : item[column.key]}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <ActionButtons item={item} onView={onView} onEdit={onEdit} onDelete={onDelete} size="sm" />
      </div>
    </div>
  );
};

/**
 * Action Buttons Component
 */
const ActionButtons = ({ item, onView, onEdit, onDelete, size = 'md' }) => {
  return (
    <div className="flex space-x-2">
      {onView && (
        <MobileButton
          onClick={() => onView(item)}
          variant="ghost"
          size={size}
          icon={FaEye}
          className="text-blue-600 hover:text-blue-900"
          title="View"
        />
      )}
      {onEdit && (
        <MobileButton
          onClick={() => onEdit(item)}
          variant="ghost"
          size={size}
          icon={FaEdit}
          className="text-mcan-primary hover:text-mcan-secondary"
          title="Edit"
        />
      )}
      {onDelete && (
        <MobileButton
          onClick={() => onDelete(item)}
          variant="ghost"
          size={size}
          icon={FaTrash}
          className="text-red-600 hover:text-red-900"
          title="Delete"
        />
      )}
    </div>
  );
};

export default ResponsiveDataDisplay;
