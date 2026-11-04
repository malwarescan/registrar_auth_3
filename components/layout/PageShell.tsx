import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";
import { SiteFooter } from "./SiteFooter";

type PageShellProps = {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
  headerTitle?: string;
  showLogo?: boolean;
  showSearch?: boolean;
  backHref?: string;
  hideNav?: boolean;
  fullWidth?: boolean;
};

export function PageShell({
  children,
  rightSidebar,
  headerTitle,
  showLogo = true,
  showSearch,
  backHref,
  hideNav,
  fullWidth,
}: PageShellProps) {
  return (
    <div className="flex min-h-dvh bg-[var(--surface)]">
      {!hideNav && <SideNav />}
      <div className="flex min-h-dvh flex-1 flex-col lg:pl-[var(--sidebar-width)]">
        <AppHeader
          title={headerTitle}
          showLogo={showLogo}
          showSearch={showSearch}
          backHref={backHref}
        />
        <div className="flex flex-1">
          <main
            className={`mx-auto w-full flex-1 px-4 pb-8 pt-4 md:px-6 lg:pt-6 ${
              fullWidth ? "max-w-none" : "max-w-[var(--container-max)]"
            } ${rightSidebar ? "xl:pr-0" : ""}`}
          >
            {children}
          </main>
          {rightSidebar && (
            <aside className="hidden w-[var(--control-panel-width)] shrink-0 border-l border-[var(--outline-variant)] bg-white xl:block">
              <div className="sticky top-0 max-h-dvh overflow-y-auto p-4">{rightSidebar}</div>
            </aside>
          )}
        </div>
        {!hideNav && <SiteFooter />}
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
