import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

import { ApiError } from "../../shared/api/ApiError";
import {
  getProfile,
  getProfileTaxonomy,
  updateProfile,
  type Profile,
  type ProfileTaxonomy,
} from "../../shared/api/me";
import { useI18n } from "../../shared/i18n/LanguageContext";
import {
  getProfileOptionLabels,
  mapBudgetMaxToApiValue,
  mapProfileLabelsToApiValues,
  mapProfileMultiApiToLabels,
  mapProfileSingleApiToLabel,
  mapProfileSingleLabelToApiValue,
  resolveProfileTaxonomy,
} from "../../shared/profile/taxonomy";

import { LoadingSpinner } from "./LoadingSpinner";
import { ProfileWizard } from "./ProfileWizard";

type ProfileWizardData = {
  skinType?: string[];
  goals?: string[];
  avoidFlags?: string[];
  budgetMin?: number;
  budgetMax?: number;
  hairProfile?: { type?: string[]; concerns?: string[] };
  makeupProfile?: { coverage?: string; skinTone?: string };
  fragranceProfile?: { notes?: string[]; intensity?: string };
};

interface ProfileGateProps {
  children: ReactNode;
  requiredKeys?: string[];
}

const DEFAULT_REQUIRED_KEYS = ["skin_type", "goals"];

const gateCopy = {
  ru: {
    loading: "Загружаем профиль...",
    title: "Заполните профиль",
    description:
      "Чтобы подобрать персональный уход, нам нужно узнать немного о вашей коже.",
    saved: "Профиль сохранён.",
    saveError: "Не удалось сохранить профиль.",
  },
  kk: {
    loading: "Профильді жүктеп жатырмыз...",
    title: "Профильді толтырыңыз",
    description:
      "Жеке күтімді құру үшін терініз туралы шамалы мәлімет қажет.",
    saved: "Профиль сақталды.",
    saveError: "Профильді сақтау мүмкін болмады.",
  },
  en: {
    loading: "Loading profile...",
    title: "Complete your profile",
    description:
      "We need a few details about your skin to build personal recommendations.",
    saved: "Profile saved.",
    saveError: "Could not save profile.",
  },
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isProfileComplete(
  profile: Profile | null,
  requiredKeys: string[],
): boolean {
  if (!profile) return false;
  return requiredKeys.every((key) => {
    const value = (profile as Record<string, unknown>)[key];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim().length > 0;
    if (isRecord(value)) return Object.keys(value).length > 0;
    return Boolean(value);
  });
}

export function ProfileGate({
  children,
  requiredKeys = DEFAULT_REQUIRED_KEYS,
}: ProfileGateProps) {
  const { language } = useI18n();
  const copy = gateCopy[language];
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [taxonomy, setTaxonomy] = useState<ProfileTaxonomy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [profileResponse, taxonomyResponse] = await Promise.all([
          getProfile(),
          getProfileTaxonomy().catch(() => null),
        ]);
        if (cancelled) return;
        setProfile(profileResponse ?? null);
        setTaxonomy(taxonomyResponse);
      } catch (loadError) {
        if (cancelled) return;
        if (
          loadError instanceof ApiError &&
          (loadError.status === 401 || loadError.status === 403)
        ) {
          navigate("/login", { replace: true, state: { from: location.pathname } });
          return;
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolvedTaxonomy = useMemo(
    () => resolveProfileTaxonomy(taxonomy, language),
    [taxonomy, language],
  );

  const wizardOptions = useMemo(
    () => ({
      steps: resolvedTaxonomy.steps.map((step) => ({
        id: step.id,
        title: step.title,
        description: step.description,
      })),
      skinTypes: getProfileOptionLabels(resolvedTaxonomy.skin_types),
      skinGoals: getProfileOptionLabels(resolvedTaxonomy.goals),
      avoidFlags: getProfileOptionLabels(resolvedTaxonomy.avoid_flags),
      hairTypes: getProfileOptionLabels(resolvedTaxonomy.hair_types),
      hairConcerns: getProfileOptionLabels(resolvedTaxonomy.hair_concerns),
      coverageOptions: getProfileOptionLabels(resolvedTaxonomy.coverage_options),
      fragranceNotes: getProfileOptionLabels(resolvedTaxonomy.fragrance_notes),
      intensityOptions: getProfileOptionLabels(resolvedTaxonomy.intensity_options),
    }),
    [resolvedTaxonomy],
  );

  const wizardInitialData = useMemo<ProfileWizardData>(() => {
    const source = (profile ?? {}) as Record<string, unknown>;
    const hairProfile = isRecord(source.hair_profile) ? source.hair_profile : {};
    const makeupProfile = isRecord(source.makeup_profile) ? source.makeup_profile : {};
    const fragranceProfile = isRecord(source.fragrance_profile) ? source.fragrance_profile : {};
    const budgetOption = resolvedTaxonomy.budget_options.find(
      (option) => option.value === source.budget,
    );
    const budgetMin = typeof budgetOption?.min === "number" ? budgetOption.min : 500;
    const budgetMax = typeof budgetOption?.max === "number" ? budgetOption.max : 10000;

    return {
      skinType: (() => {
        const label = mapProfileSingleApiToLabel(
          resolvedTaxonomy.skin_types,
          source.skin_type,
        );
        return label ? [label] : [];
      })(),
      goals: mapProfileMultiApiToLabels(resolvedTaxonomy.goals, source.goals),
      avoidFlags: mapProfileMultiApiToLabels(
        resolvedTaxonomy.avoid_flags,
        source.avoid_flags,
      ),
      budgetMin,
      budgetMax,
      hairProfile: {
        type: (() => {
          const legacy = Array.isArray(hairProfile.type)
            ? hairProfile.type[0]
            : hairProfile.type;
          const label = mapProfileSingleApiToLabel(
            resolvedTaxonomy.hair_types,
            hairProfile.hair_type ?? legacy,
          );
          return label ? [label] : [];
        })(),
        concerns: mapProfileMultiApiToLabels(
          resolvedTaxonomy.hair_concerns,
          hairProfile.concerns,
        ),
      },
      makeupProfile: {
        coverage:
          mapProfileSingleApiToLabel(
            resolvedTaxonomy.coverage_options,
            Array.isArray(makeupProfile.coverage_pref)
              ? makeupProfile.coverage_pref[0]
              : makeupProfile.coverage,
          ) ?? undefined,
      },
      fragranceProfile: {
        notes: mapProfileMultiApiToLabels(
          resolvedTaxonomy.fragrance_notes,
          fragranceProfile.liked_notes ?? fragranceProfile.notes,
        ),
        intensity:
          mapProfileSingleApiToLabel(
            resolvedTaxonomy.intensity_options,
            fragranceProfile.intensity_pref ?? fragranceProfile.intensity,
          ) ?? undefined,
      },
    };
  }, [profile, resolvedTaxonomy]);

  if (loading) {
    return (
      <div className="page-with-navbar-offset min-h-screen bg-gray-50">
        <div className="flex flex-col items-center justify-center py-32">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">{copy.loading}</p>
        </div>
      </div>
    );
  }

  if (isProfileComplete(profile, requiredKeys)) {
    return <>{children}</>;
  }

  const handleComplete = async (data: ProfileWizardData) => {
    const hairType = mapProfileSingleLabelToApiValue(
      resolvedTaxonomy.hair_types,
      data.hairProfile?.type?.[0],
      "",
    );
    const hairConcerns = mapProfileLabelsToApiValues(
      resolvedTaxonomy.hair_concerns,
      data.hairProfile?.concerns,
    );
    const makeupCoverage = mapProfileSingleLabelToApiValue(
      resolvedTaxonomy.coverage_options,
      data.makeupProfile?.coverage,
      "",
    );
    const fragranceNotes = mapProfileLabelsToApiValues(
      resolvedTaxonomy.fragrance_notes,
      data.fragranceProfile?.notes,
    );
    const fragranceIntensity = mapProfileSingleLabelToApiValue(
      resolvedTaxonomy.intensity_options,
      data.fragranceProfile?.intensity,
      "",
    );

    const payload = {
      skin_type: mapProfileSingleLabelToApiValue(
        resolvedTaxonomy.skin_types,
        data.skinType?.[0],
        "normal",
      ),
      goals: mapProfileLabelsToApiValues(resolvedTaxonomy.goals, data.goals),
      avoid_flags: mapProfileLabelsToApiValues(
        resolvedTaxonomy.avoid_flags,
        data.avoidFlags,
      ),
      budget: mapBudgetMaxToApiValue(resolvedTaxonomy.budget_options, data.budgetMax),
      hair_profile: {
        ...(hairType ? { hair_type: hairType } : {}),
        ...(hairConcerns.length > 0 ? { concerns: hairConcerns } : {}),
      },
      makeup_profile: {
        ...(makeupCoverage ? { coverage_pref: [makeupCoverage] } : {}),
      },
      fragrance_profile: {
        ...(fragranceNotes.length > 0 ? { liked_notes: fragranceNotes } : {}),
        ...(fragranceIntensity ? { intensity_pref: fragranceIntensity } : {}),
      },
    };

    try {
      const response = await updateProfile(payload);
      const updatedProfile =
        response && typeof response === "object" && "profile" in response && response.profile
          ? (response.profile as Profile)
          : (response as Profile);
      const nextProfile =
        updatedProfile && Object.keys(updatedProfile).length > 0
          ? updatedProfile
          : await getProfile();
      setProfile(nextProfile ?? null);
      toast.success(copy.saved);
    } catch (saveError) {
      if (
        saveError instanceof ApiError &&
        (saveError.status === 401 || saveError.status === 403)
      ) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }
      toast.error(copy.saveError);
      throw saveError;
    }
  };

  return (
    <div className="page-with-navbar-offset min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-[#FF4DB8]" />
            <h1 className="text-3xl font-semibold text-gray-900">{copy.title}</h1>
          </div>
          <p className="text-gray-600">{copy.description}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileWizard
          options={wizardOptions}
          initialData={wizardInitialData}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
