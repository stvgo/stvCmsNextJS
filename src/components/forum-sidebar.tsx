import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Info, BarChart } from "lucide-react";

export function ForumSidebar() {
  return (
    <div className="space-y-6">
      {/* About Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Info className="w-5 h-5 mr-2 text-primary" />
            About This Forum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Welcome to the community! This is a place to share knowledge, discuss topics, and stay updated with the latest news.
          </p>
        </CardContent>
      </Card>

      {/* Trending Topics Widget (Static for now) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="text-sm hover:underline cursor-pointer text-muted-foreground hover:text-foreground">
              #webdevelopment
            </li>
            <li className="text-sm hover:underline cursor-pointer text-muted-foreground hover:text-foreground">
              #nextjs
            </li>
            <li className="text-sm hover:underline cursor-pointer text-muted-foreground hover:text-foreground">
              #react
            </li>
            <li className="text-sm hover:underline cursor-pointer text-muted-foreground hover:text-foreground">
              #design
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Statistics Widget (Static for now) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <BarChart className="w-5 h-5 mr-2 text-primary" />
            Community Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Members</span>
            <span className="font-medium">1,234</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Posts</span>
            <span className="font-medium">567</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
