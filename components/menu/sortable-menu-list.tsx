'use client'

import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableMenuItem } from './sortable-menu-item'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { type MenuItem } from '@/types/menu'

interface SortableMenuListProps {
  items: MenuItem[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  selectedItems: Set<string>;
  imageLoading: boolean;
  onDragEnd: (event: DragEndEvent) => void;
  onSelectItem: (id: string, checked: boolean) => void;
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (id: string) => void;
  onImageLoad: () => void;
  onImageError: () => void;
}

export default function SortableMenuList({
  items,
  loading,
  viewMode,
  selectedItems,
  imageLoading,
  onDragEnd,
  onSelectItem,
  onEditItem,
  onDeleteItem,
  onImageLoad,
  onImageError,
}: SortableMenuListProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  if (loading) {
    return (
      <div className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      )}>
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            {viewMode === 'grid' ? (
              <>
                <div className="relative aspect-video">
                  <Skeleton className="absolute inset-0" />
                </div>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </>
            ) : (
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-1/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={items.map(item => item.id)}
        strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
      >
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {items.map((item) => (
            <SortableMenuItem
              key={item.id}
              item={item}
              viewMode={viewMode}
              isSelected={selectedItems.has(item.id)}
              imageLoading={imageLoading}
              onSelect={(checked) => onSelectItem(item.id, checked)}
              onEdit={() => onEditItem(item)}
              onDelete={() => onDeleteItem(item.id)}
              onImageLoad={onImageLoad}
              onImageError={onImageError}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
} 
