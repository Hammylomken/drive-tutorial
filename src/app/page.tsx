"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { ScrollArea } from "~/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import {
  FolderIcon,
  FileTextIcon,
  ImageIcon,
  FileSpreadsheetIcon,
  FileCodeIcon,
  ArchiveIcon,
  PlusIcon,
  SearchIcon,
  GridIcon,
  ListIcon,
  HardDriveIcon,
  UsersIcon,
  ClockIcon,
  StarIcon,
  TrashIcon,
  CloudIcon,
  UploadIcon,
  FolderPlusIcon,
  ChevronRightIcon,
} from "lucide-react"

// Type definitions
interface FileItem {
  id: string
  name: string
  type: "document" | "image" | "spreadsheet" | "code" | "archive"
  size: string
  modified: string
  url: string
}

interface FolderItem {
  id: string
  name: string
  type: "folder"
  items: (FileItem | FolderItem)[]
  modified: string
}

type DriveItem = FileItem | FolderItem

// Mock data
const mockData: DriveItem[] = [
  {
    id: "1",
    name: "Projects",
    type: "folder",
    modified: "Mar 15, 2026",
    items: [
      {
        id: "1-1",
        name: "Website Redesign",
        type: "folder",
        modified: "Mar 10, 2026",
        items: [
          { id: "1-1-1", name: "mockups.fig", type: "image", size: "24 MB", modified: "Mar 8, 2026", url: "#mockups" },
          { id: "1-1-2", name: "requirements.docx", type: "document", size: "156 KB", modified: "Mar 5, 2026", url: "#requirements" },
          { id: "1-1-3", name: "styles.css", type: "code", size: "12 KB", modified: "Mar 10, 2026", url: "#styles" },
        ],
      },
      {
        id: "1-2",
        name: "Mobile App",
        type: "folder",
        modified: "Feb 28, 2026",
        items: [
          { id: "1-2-1", name: "App.tsx", type: "code", size: "8 KB", modified: "Feb 28, 2026", url: "#app-tsx" },
          { id: "1-2-2", name: "design-system.pdf", type: "document", size: "2.4 MB", modified: "Feb 20, 2026", url: "#design-system" },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Photos",
    type: "folder",
    modified: "Mar 20, 2026",
    items: [
      {
        id: "2-1",
        name: "Vacation 2026",
        type: "folder",
        modified: "Mar 18, 2026",
        items: [
          { id: "2-1-1", name: "beach-sunset.jpg", type: "image", size: "4.2 MB", modified: "Mar 15, 2026", url: "#beach-sunset" },
          { id: "2-1-2", name: "mountain-view.jpg", type: "image", size: "5.1 MB", modified: "Mar 16, 2026", url: "#mountain-view" },
          { id: "2-1-3", name: "group-photo.jpg", type: "image", size: "3.8 MB", modified: "Mar 17, 2026", url: "#group-photo" },
        ],
      },
      { id: "2-2", name: "profile-pic.png", type: "image", size: "1.2 MB", modified: "Jan 5, 2026", url: "#profile-pic" },
    ],
  },
  {
    id: "3",
    name: "Documents",
    type: "folder",
    modified: "Mar 22, 2026",
    items: [
      { id: "3-1", name: "Resume.pdf", type: "document", size: "245 KB", modified: "Mar 22, 2026", url: "#resume" },
      { id: "3-2", name: "Contract.docx", type: "document", size: "89 KB", modified: "Mar 1, 2026", url: "#contract" },
      { id: "3-3", name: "Notes.txt", type: "document", size: "12 KB", modified: "Feb 15, 2026", url: "#notes" },
    ],
  },
  { id: "4", name: "Budget-2026.xlsx", type: "spreadsheet", size: "156 KB", modified: "Mar 25, 2026", url: "#budget" },
  { id: "5", name: "Presentation.pptx", type: "document", size: "8.4 MB", modified: "Mar 24, 2026", url: "#presentation" },
  { id: "6", name: "backup.zip", type: "archive", size: "124 MB", modified: "Mar 20, 2026", url: "#backup" },
  { id: "7", name: "index.html", type: "code", size: "4 KB", modified: "Mar 18, 2026", url: "#index-html" },
  { id: "8", name: "logo.svg", type: "image", size: "24 KB", modified: "Mar 15, 2026", url: "#logo" },
]

// Get file icon based on type
function getFileIcon(type: FileItem["type"]) {
  switch (type) {
    case "document":
      return <FileTextIcon className="size-5 text-blue-400" />
    case "image":
      return <ImageIcon className="size-5 text-red-400" />
    case "spreadsheet":
      return <FileSpreadsheetIcon className="size-5 text-green-400" />
    case "code":
      return <FileCodeIcon className="size-5 text-yellow-400" />
    case "archive":
      return <ArchiveIcon className="size-5 text-orange-400" />
    default:
      return <FileTextIcon className="size-5 text-muted-foreground" />
  }
}

export default function DrivePage() {
  const [currentPath, setCurrentPath] = useState<{ id: string; name: string }[]>([
    { id: "root", name: "My Drive" },
  ])
  const [currentItems, setCurrentItems] = useState<DriveItem[]>(mockData)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  // Navigate into a folder
  const openFolder = (folder: FolderItem) => {
    setCurrentPath([...currentPath, { id: folder.id, name: folder.name }])
    setCurrentItems(folder.items)
  }

  // Navigate to a specific path index
  const navigateToPath = (index: number) => {
    if (index === 0) {
      setCurrentPath([{ id: "root", name: "My Drive" }])
      setCurrentItems(mockData)
    } else {
      const newPath = currentPath.slice(0, index + 1)
      setCurrentPath(newPath)

      // Traverse the mock data to find the correct items
      let items: DriveItem[] = mockData
      for (let i = 1; i < newPath.length; i++) {
        const folder = items.find(
          (item): item is FolderItem => item.type === "folder" && item.id === newPath[i]?.id
        )
        if (folder) {
          items = folder.items
        }
      }
      setCurrentItems(items)
    }
  }

  // Filter items based on search
  const filteredItems = currentItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Mock upload handler
  const handleUpload = (type: "file" | "folder") => {
    alert(`Mock ${type} upload triggered! In a real app, this would open a file picker.`)
    setUploadDialogOpen(false)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col bg-card">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <CloudIcon className="size-8 text-primary" />
            <span className="text-xl font-semibold text-foreground">Droce</span>
          </div>

          {/* Upload Button */}
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full gap-2 mb-6" size="lg">
                <PlusIcon className="size-5" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload to Droce</DialogTitle>
                <DialogDescription>
                  Choose what you want to upload to your drive.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 pt-4">
                <Button
                  variant="outline"
                  className="justify-start gap-3 h-14"
                  onClick={() => handleUpload("file")}
                >
                  <UploadIcon className="size-5" />
                  <div className="text-left">
                    <div className="font-medium">File upload</div>
                    <div className="text-xs text-muted-foreground">Upload files from your device</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-3 h-14"
                  onClick={() => handleUpload("folder")}
                >
                  <FolderPlusIcon className="size-5" />
                  <div className="text-left">
                    <div className="font-medium">Folder upload</div>
                    <div className="text-xs text-muted-foreground">Upload an entire folder</div>
                  </div>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2">
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground">
              <HardDriveIcon className="size-5" />
              <span>My Drive</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors">
              <UsersIcon className="size-5" />
              <span>Shared with me</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors">
              <ClockIcon className="size-5" />
              <span>Recent</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors">
              <StarIcon className="size-5" />
              <span>Starred</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors">
              <TrashIcon className="size-5" />
              <span>Trash</span>
            </button>
          </nav>
        </ScrollArea>

        {/* Storage info */}
        <div className="p-4 border-t border-border">
          <div className="text-sm text-muted-foreground mb-2">Storage</div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
            <div className="h-full w-1/3 bg-primary rounded-full" />
          </div>
          <div className="text-xs text-muted-foreground">5.2 GB of 15 GB used</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-xl flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search in Drive"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <GridIcon className="size-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <ListIcon className="size-4" />
            </Button>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="px-6 py-3 flex items-center gap-1 text-sm">
          {currentPath.map((item, index) => (
            <div key={item.id} className="flex items-center gap-1">
              {index > 0 && <ChevronRightIcon className="size-4 text-muted-foreground" />}
              <button
                onClick={() => navigateToPath(index)}
                className={`px-2 py-1 rounded hover:bg-secondary transition-colors ${index === currentPath.length - 1
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {item.name}
              </button>
            </div>
          ))}
        </div>

        {/* File grid/list */}
        <ScrollArea className="flex-1 px-6 pb-6">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredItems.map((item) =>
                item.type === "folder" ? (
                  <button
                    key={item.id}
                    onClick={() => openFolder(item)}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl bg-card border border-border hover:bg-secondary hover:border-primary/50 transition-all group"
                  >
                    <FolderIcon className="size-12 text-primary fill-primary/20" />
                    <div className="text-center">
                      <div className="text-sm font-medium text-foreground truncate max-w-full">
                        {item.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{item.modified}</div>
                    </div>
                  </button>
                ) : (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 p-4 rounded-xl bg-card border border-border hover:bg-secondary hover:border-primary/50 transition-all group"
                  >
                    <div className="size-12 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-card">
                      {getFileIcon(item.type)}
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-foreground truncate max-w-full">
                        {item.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{item.size}</div>
                    </div>
                  </a>
                )
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {/* List header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs text-muted-foreground font-medium">
                <div className="col-span-6">Name</div>
                <div className="col-span-2">Modified</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-2">Type</div>
              </div>
              {filteredItems.map((item) =>
                item.type === "folder" ? (
                  <button
                    key={item.id}
                    onClick={() => openFolder(item)}
                    className="w-full grid grid-cols-12 gap-4 px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
                  >
                    <div className="col-span-6 flex items-center gap-3">
                      <FolderIcon className="size-5 text-primary fill-primary/20" />
                      <span className="text-sm text-foreground truncate">{item.name}</span>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">{item.modified}</div>
                    <div className="col-span-2 text-sm text-muted-foreground">-</div>
                    <div className="col-span-2 text-sm text-muted-foreground">Folder</div>
                  </button>
                ) : (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="col-span-6 flex items-center gap-3">
                      {getFileIcon(item.type)}
                      <span className="text-sm text-foreground truncate">{item.name}</span>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">{item.modified}</div>
                    <div className="col-span-2 text-sm text-muted-foreground">{item.size}</div>
                    <div className="col-span-2 text-sm text-muted-foreground capitalize">{item.type}</div>
                  </a>
                )
              )}
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <SearchIcon className="size-12 mb-4 opacity-50" />
              <div className="text-lg font-medium">No files found</div>
              <div className="text-sm">Try a different search term</div>
            </div>
          )}
        </ScrollArea>
      </main>
    </div>
  )
}

