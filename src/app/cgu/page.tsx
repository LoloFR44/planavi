import Header from '@/components/Header';
import Link from 'next/link';

export const metadata = {
  title: 'CGU - Planavi',
};

export default function CGUPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/" className="text-sm text-[#1e3a8a] hover:underline mb-4 inline-block">&larr; Retour à l&apos;accueil</Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Conditions Générales d&apos;Utilisation</h1>
          <p className="text-sm text-gray-400 mb-6">Dernière mise à jour : 28 mars 2026</p>

          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6 text-sm text-gray-700 leading-relaxed">

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">1. Objet</h2>
              <p>
                Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation du service Planavi, accessible à l&apos;adresse planning-visites.fr. Planavi est un outil gratuit de planification de visites permettant de coordonner les visites auprès de proches (à domicile, en établissement de santé ou en maison de retraite).
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">2. Acceptation des CGU</h2>
              <p>
                L&apos;utilisation du service implique l&apos;acceptation pleine et entière des présentes CGU. Si vous n&apos;acceptez pas ces conditions, vous êtes invité à ne pas utiliser le service.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">3. Description du service</h2>
              <p>Planavi permet de :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Créer des plannings de visites avec des créneaux horaires configurables</li>
                <li>Partager un lien public permettant aux visiteurs de réserver un créneau</li>
                <li>Consulter les réservations existantes en temps réel</li>
                <li>Échanger des messages entre visiteurs via un mur de messages</li>
              </ul>
              <p className="mt-2">Le service est fourni gratuitement, sans garantie de disponibilité permanente.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">4. Données personnelles</h2>
              <p>Les données collectées se limitent aux informations fournies volontairement par les utilisateurs :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Prénom et nom du visiteur (pour les réservations)</li>
                <li>Numéro de téléphone et email (optionnels)</li>
                <li>Messages publiés sur le mur de messages</li>
                <li>Informations relatives à la personne visitée (nom, lieu)</li>
              </ul>
              <p className="mt-2">
                Ces données sont stockées sur les serveurs Firebase (Google Cloud) situés en Europe (région eur3). Elles ne sont ni vendues, ni transmises à des tiers à des fins commerciales. Elles sont utilisées uniquement pour le fonctionnement du service.
              </p>
              <p className="mt-2">
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous à l&apos;adresse : <a href="mailto:contact@planning-visites.fr" className="text-[#1e3a8a] hover:underline">contact@planning-visites.fr</a>.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">5. Responsabilités de l&apos;utilisateur</h2>
              <p>L&apos;utilisateur s&apos;engage à :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Fournir des informations exactes lors de la réservation</li>
                <li>Ne pas utiliser le service à des fins illicites ou abusives</li>
                <li>Ne pas publier de contenu offensant, diffamatoire ou contraire à la loi sur le mur de messages</li>
                <li>Respecter la vie privée des autres utilisateurs et de la personne visitée</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">6. Responsabilités de l&apos;éditeur</h2>
              <p>
                L&apos;éditeur met tout en œuvre pour assurer la disponibilité et le bon fonctionnement du service. Toutefois, il ne saurait être tenu responsable en cas d&apos;interruption, de dysfonctionnement ou de perte de données. Le service est fourni « en l&apos;état », sans garantie d&apos;aucune sorte.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">7. Cookies</h2>
              <p>
                Le service n&apos;utilise pas de cookies publicitaires. Seuls des cookies techniques strictement nécessaires au fonctionnement (authentification admin, session) peuvent être utilisés.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">8. Propriété intellectuelle</h2>
              <p>
                Le nom « Planavi », le logo et l&apos;ensemble des éléments graphiques du site sont la propriété de l&apos;éditeur. Toute reproduction non autorisée est interdite.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">9. Modification des CGU</h2>
              <p>
                L&apos;éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle. La continuation de l&apos;utilisation du service vaut acceptation des nouvelles conditions.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">10. Droit applicable</h2>
              <p>
                Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
