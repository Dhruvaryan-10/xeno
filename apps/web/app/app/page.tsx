"use client";

import { useState } from "react";
import Link from "next/link";
import { AppMenu, type Section } from "@/components/app-menu";
import { BrandMark } from "@/components/brand-mark";
import { CampaignWizard } from "@/components/campaign-wizard";
import { CampaignsView } from "@/components/campaigns-view";
import { CustomersView } from "@/components/customers-view";
import { Dashboard } from "@/components/dashboard";

export default function AppPage() {
  const [section, setSection] = useState<Section>("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [justSent, setJustSent] = useState(false);

  function go(next: Section) {
    setSection(next);
    setJustSent(false);
    window.scrollTo({ top: 0 });
  }

  function openCampaign(id: string) {
    setSelectedCampaignId(id);
    go("Campaigns");
  }

  return (
    <div className="min-h-[100dvh] pt-[env(safe-area-inset-top)]">
      {/* inert keeps the page out of tab order and screen readers while the wizard is open */}
      <main inert={wizardOpen} className="mx-auto max-w-[90rem] px-4 pb-28 pt-5 sm:px-6 lg:px-10">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-muted hover:text-ink">
          <BrandMark className="h-6 w-6" />
          Campaign Copilot
        </Link>

        <div hidden={section !== "Dashboard"}>
          <Dashboard active={section === "Dashboard" && !wizardOpen} onNewCampaign={() => setWizardOpen(true)} onOpenCampaign={openCampaign} onOpenCustomers={() => go("Customers")} />
        </div>
        <div hidden={section !== "Campaigns"}>
          <CampaignsView
            active={section === "Campaigns" && !wizardOpen}
            selectedId={selectedCampaignId}
            onSelect={setSelectedCampaignId}
            justSent={justSent}
            onCreate={() => setWizardOpen(true)}
          />
        </div>
        <div hidden={section !== "Customers"}>
          <CustomersView active={section === "Customers"} />
        </div>
      </main>

      {wizardOpen ? (
        <CampaignWizard
          onClose={() => setWizardOpen(false)}
          onSent={(id) => {
            setWizardOpen(false);
            openCampaign(id);
            setJustSent(true);
          }}
        />
      ) : (
        <AppMenu open={menuOpen} onOpenChange={setMenuOpen} current={section} onNavigate={go} onNewCampaign={() => setWizardOpen(true)} />
      )}
    </div>
  );
}
