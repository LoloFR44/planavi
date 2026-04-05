import Header from '@/components/Header';
import Link from 'next/link';

export const metadata = {
  title: 'Mentions légales - Planavi',
};

export default function MentionsLegalesPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/" className="text-sm text-[#1e3a8a] hover:underline mb-4 inline-block">&larr; Retour à l&apos;accueil</Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Mentions légales</h1>

          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6 text-sm text-gray-700 leading-relaxed">

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">Éditeur du site</h2>
              <p>
                Le site planning-visites.fr est édité par :<br />
                <strong>Loic Fleury</strong><br />
                Adresse email : <a href="/contact" className="text-[#1e3a8a] hover:underline">formulaire de contact</a>
              </p>
              <p className="mt-2">
                Ce site est un projet personnel à but non lucratif.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">Hébergement</h2>
              <p>
                Le site est hébergé par :<br />
                <strong>Vercel Inc.</strong><br />
                440 N Barranca Ave #4133<br />
                Covina, CA 91723, États-Unis<br />
                Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#1e3a8a] hover:underline">vercel.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">Base de données</h2>
              <p>
                Les données sont stockées sur <strong>Google Firebase (Firestore)</strong>, dans la région Europe (eur3), conformément au RGPD.<br />
                Fournisseur : Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, États-Unis.<br />
                Google est certifié dans le cadre du EU-US Data Privacy Framework.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">Nom de domaine</h2>
              <p>
                Le nom de domaine planning-visites.fr est enregistré auprès de :<br />
                <strong>OVH SAS</strong><br />
                2 rue Kellermann, 59100 Roubaix, France<br />
                Site web : <a href="https://www.ovh.com" target="_blank" rel="noopener noreferrer" className="text-[#1e3a8a] hover:underline">ovh.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">Protection des données personnelles</h2>
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679), vous disposez des droits suivants sur vos données personnelles :
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Droit d&apos;accès</strong> : obtenir la confirmation que vos données sont traitées et en obtenir une copie</li>
                <li><strong>Droit de rectification</strong> : demander la correction de données inexactes</li>
                <li><strong>Droit à l&apos;effacement</strong> : demander la suppression de vos données</li>
                <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
                <li><strong>Droit d&apos;opposition</strong> : vous opposer au traitement de vos données</li>
              </ul>
              <p className="mt-2">
                Pour exercer ces droits, contactez : <a href="/contact" className="text-[#1e3a8a] hover:underline">formulaire de contact</a>
              </p>
              <p className="mt-2">
                En cas de litige, vous pouvez adresser une réclamation à la CNIL :<br />
                Commission Nationale de l&apos;Informatique et des Libertés<br />
                3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07<br />
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#1e3a8a] hover:underline">www.cnil.fr</a>
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">Cookies</h2>
              <p>
                Ce site n&apos;utilise pas de cookies publicitaires ni de traceurs tiers. Seuls des cookies techniques nécessaires au fonctionnement du service (authentification, session) sont susceptibles d&apos;être déposés.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">Propriété intellectuelle</h2>
              <p>
                L&apos;ensemble des contenus du site (textes, images, logo, code source) sont protégés par le droit de la propriété intellectuelle. Toute reproduction, représentation ou exploitation non autorisée est strictement interdite.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">Limitation de responsabilité</h2>
              <p>
                L&apos;éditeur ne saurait être tenu responsable des dommages directs ou indirects résultant de l&apos;utilisation du service, notamment en cas de perte de données, d&apos;indisponibilité du service ou d&apos;utilisation frauduleuse par un tiers.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
