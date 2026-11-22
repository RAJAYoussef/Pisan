// Pages d'information : politique de confidentialité, mentions légales et note aux familles (imprimable).
// Elles décrivent ce que fait réellement l'application ; toute évolution du traitement doit y être reportée.
import { useEffect, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isPlaceholder, LEGAL } from '@/lib/legal';
import { BrandMark } from './brand';

const V = ({ v }: { v: string }) => (isPlaceholder(v) ? <mark className="legal-todo">{v}</mark> : <>{v}</>);

function Shell({ title, children, print = false }: { title: string; children: ReactNode; print?: boolean }) {
  return <main className="legal-page">
    <div className="legal-bar report-toolbar">
      <Link to="/" className="legal-back">← Retour à PiSan</Link>
      <nav className="legal-nav" aria-label="Informations"><Link to="/coach">Coach Pi</Link><Link to="/confidentialite">Confidentialité</Link><Link to="/familles">Note aux familles</Link></nav>
      {print && <Button size="sm" onClick={() => window.print()}><Printer />Imprimer / PDF</Button>}
    </div>
    <article className="legal-doc">
      <header className="legal-head"><BrandMark /><div><h1>{title}</h1><p className="legal-meta">Dernière mise à jour : {LEGAL.updated}</p></div></header>
      {children}
    </article>
  </main>;
}

export function PrivacyPage() {
  return <Shell title="Confidentialité et mentions légales">
    <p className="legal-lead">PiSan est une application d’entraînement aux mathématiques utilisée dans un cadre scolaire. Elle est conçue pour collecter le moins possible de données : <strong>aucune adresse e-mail, aucun nom réel et aucun mot de passe ne sont demandés aux élèves</strong>.</p>

    <h2 id="responsable">1. Responsable du traitement</h2>
    <p><V v={LEGAL.publisher} /> — <V v={LEGAL.publisherAddress} />. Contact pour toute question ou demande : <V v={LEGAL.contact} />.</p>
    <p>Lorsque PiSan est utilisé par un établissement, c’est l’établissement qui décide de son usage pédagogique et qui informe les familles ; l’éditeur agit alors pour son compte.</p>

    <h2 id="eleves">2. Données des élèves</h2>
    <ul>
      <li><strong>Profil :</strong> un pseudonyme choisi par l’élève (nous recommandons de ne pas y mettre son nom de famille), le pays du programme suivi, le niveau scolaire, la filière éventuelle, la langue d’affichage et le fuseau horaire (pour compter les jours de la série).</li>
      <li><strong>Progression :</strong> résultats des exercices, des parcours, des mini-contrôles et des tests (bonnes réponses, date, durée), série de jours, défi du jour, réglages d’affichage adaptés (DYS).</li>
      <li><strong>Classe :</strong> si l’élève rejoint une classe avec le code donné par son enseignant, l’appartenance à cette classe et les résultats des tests de positionnement A et B.</li>
      <li><strong>Journal des fractions :</strong> pour certaines activités de fractions, les manipulations faites à l’écran, afin d’aider l’enseignant à comprendre les erreurs.</li>
      <li><strong>Code de reprise :</strong> le profil est retrouvé grâce à un code conservé sur l’appareil de l’élève. Le serveur n’en garde qu’une empreinte chiffrée (irréversible) : personne, ni l’enseignant ni l’éditeur, ne peut le relire. En cas de perte, l’enseignant peut en émettre un nouveau.</li>
    </ul>

    <h2 id="enseignants">3. Données des enseignants</h2>
    <p>Adresse e-mail professionnelle, nom affiché, établissement, classes créées, notions assignées et date de dernière connexion. Les comptes sont créés par l’administrateur de PiSan ; le mot de passe est choisi par l’enseignant et n’est jamais visible.</p>

    <h2 id="finalites">4. À quoi servent ces données</h2>
    <ul>
      <li>faire fonctionner l’entraînement (corriger les réponses, proposer la suite adaptée, garder la progression d’un appareil à l’autre) ;</li>
      <li>permettre à l’enseignant de suivre sa classe et de mesurer les progrès entre le test A et le test B ;</li>
      <li>protéger le service contre les abus (limites d’usage) ;</li>
      <li>corriger les questions erronées grâce aux signalements.</li>
    </ul>
    <p>Les données ne sont <strong>ni vendues, ni utilisées à des fins publicitaires, ni utilisées pour du profilage commercial</strong>. Il n’y a ni publicité ni outil de mesure d’audience tiers.</p>
    <p>Base légale : la mission éducative de l’établissement qui utilise PiSan (intérêt public ou intérêt légitime selon le statut de l’établissement).</p>

    <h2 id="coach">5. Coach Pi (assistant d’aide)</h2>
    <p>Lorsqu’il est activé pour la classe, le coach reformule des indices à partir de l’exercice en cours. Le message de l’élève est transmis, via la passerelle d’IA de Lovable, à un fournisseur de modèle de langue (OpenAI) avec une demande de non-conservation. <strong>PiSan n’enregistre pas les conversations.</strong> Le coach est désactivé pendant les tests et le diagnostic. Les élèves ne doivent pas y écrire d’informations personnelles. Voir aussi <Link to="/coach">ce que fait le coach, et ses limites</Link>.</p>

    <h2 id="signalements">6. Signalements d’erreurs</h2>
    <p>Le bouton « Signaler une erreur » envoie uniquement la question concernée, le motif choisi et le message facultatif, sans aucun identifiant de l’élève.</p>

    <h2 id="appareil">7. Ce qui est conservé sur l’appareil</h2>
    <p>PiSan n’utilise pas de cookies publicitaires ni de traceurs. Le navigateur garde seulement ce qui est nécessaire au fonctionnement (stockage local) : le code de reprise, la session de l’enseignant connecté et quelques préférences d’affichage. « Se déconnecter » efface le code de reprise de l’appareil.</p>

    <h2 id="hebergement">8. Hébergement, sécurité et destinataires</h2>
    <p>L’application et sa base de données sont hébergées par Lovable (Lovable Cloud, infrastructure Supabase) — région : <V v={LEGAL.hostingRegion} />. Les échanges sont chiffrés (HTTPS). Les données privées ne sont accessibles qu’au serveur ; l’enseignant ne voit que les élèves de ses propres classes. Pour limiter les abus, le serveur garde temporairement une empreinte de l’adresse IP (jamais l’adresse elle-même) ; l’hébergeur peut tenir ses propres journaux techniques.</p>
    <p>Destinataires : l’enseignant de la classe (progression de ses élèves), l’administrateur de PiSan (maintenance, signalements) et les sous-traitants techniques cités ci-dessus.</p>

    <h2 id="duree">9. Durée de conservation</h2>
    <p>Les données sont conservées tant que le profil ou le compte est utilisé, puis supprimées selon la règle suivante : <V v={LEGAL.retention} />. La suppression est aujourd’hui faite à la demande, par l’administrateur.</p>

    <h2 id="droits">10. Vos droits</h2>
    <p>Conformément au Règlement général sur la protection des données (RGPD) et, au Maroc, à la loi n° 09-08 relative à la protection des personnes physiques à l’égard du traitement des données à caractère personnel, l’élève (ou ses représentants légaux) et l’enseignant disposent d’un droit d’accès, de rectification, d’effacement, de limitation et d’opposition. Pour l’exercer, écrivez à <V v={LEGAL.contact} /> en indiquant la classe et le pseudonyme (ou faites la demande auprès de l’enseignant, qui la transmettra).</p>
    <p>Vous pouvez aussi saisir l’autorité de contrôle : la CNDP au Maroc (www.cndp.ma) ou, en France, la CNIL (www.cnil.fr), ou l’autorité du pays de l’établissement. Déclaration CNDP : <V v={LEGAL.cndp} />.</p>

    <h2 id="mentions">11. Mentions légales</h2>
    <dl className="legal-dl">
      <dt>Éditeur</dt><dd><V v={LEGAL.publisher} />, <V v={LEGAL.publisherAddress} /></dd>
      <dt>Directeur de la publication</dt><dd><V v={LEGAL.director} /></dd>
      <dt>Contact</dt><dd><V v={LEGAL.contact} /></dd>
      <dt>Hébergement</dt><dd>Lovable Labs Incorporated (Lovable Cloud), sur infrastructure Supabase</dd>
    </dl>
    <p>Les contenus pédagogiques, figures et logiciels de PiSan sont protégés par le droit d’auteur ; toute reproduction hors usage en classe nécessite l’accord de l’éditeur.</p>
  </Shell>;
}

export function FamilyNote() {
  // L'adresse du site n'est connue que dans le navigateur (pas au rendu serveur) : on la complète après l'hydratation.
  const [origin, setOrigin] = useState('');
  useEffect(() => { setOrigin(window.location.origin); }, []);
  return <Shell title="Note d’information aux familles" print>
    <p className="legal-lead">Madame, Monsieur,</p>
    <p>Cette année, la classe de votre enfant utilise <strong>PiSan</strong>, une application d’entraînement aux mathématiques : des activités visuelles et manipulables, des parcours de compétences et des petits contrôles, en classe et, si vous le souhaitez, à la maison.</p>

    <h2>Comment ça marche</h2>
    <ul>
      <li>Votre enfant crée un profil avec un <strong>pseudonyme</strong> (pas son nom de famille) : <strong>aucune adresse e-mail ni aucun mot de passe</strong> ne sont demandés.</li>
      <li>Il reçoit un <strong>code de reprise</strong> de 12 caractères qui lui permet de retrouver sa progression sur un autre appareil. Conservez-le précieusement : c’est la seule clé de son profil. En cas de perte, l’enseignant peut en fournir un nouveau.</li>
      <li>Il rejoint la classe avec le code donné par l’enseignant, qui voit alors ses résultats.</li>
      <li>Un test de positionnement est proposé en début d’année puis en fin d’année, pour mesurer les progrès de la classe.</li>
      <li>PiSan s’utilise dans le navigateur, sans rien télécharger dans un store. Sur téléphone, on peut l’<strong>ajouter à l’écran d’accueil</strong> (Android : menu du navigateur, « Installer l’application » ; iPhone : Safari, bouton Partager, « Sur l’écran d’accueil ») : il s’ouvre alors comme une application.</li>
    </ul>

    <h2>Les données</h2>
    <ul>
      <li>Seules sont enregistrées les informations utiles à l’apprentissage : pseudonyme, niveau, langue, résultats et progression.</li>
      <li>Elles sont visibles uniquement par l’enseignant de la classe et ne servent <strong>ni à la publicité, ni à la revente</strong>.</li>
      <li>L’assistant « Coach Pi », s’il est activé, ne conserve pas les conversations ; il est désactivé pendant les tests.</li>
      <li>Vous pouvez à tout moment demander l’accès à ces données ou leur suppression (RGPD ; loi marocaine n° 09-08) : <V v={LEGAL.contact} />.</li>
    </ul>
    <p>Le détail figure dans la politique de confidentialité : <strong>{origin}/confidentialite</strong>.</p>

    <h2>À la maison</h2>
    <p>Quelques minutes régulières valent mieux qu’une longue séance : encouragez votre enfant à chercher seul avant de demander un indice, et à utiliser le bouton « Signaler une erreur » s’il pense qu’une question est fausse.</p>

    <div className="legal-sign">
      <p>L’équipe pédagogique — <V v={LEGAL.publisher} /></p>
      <div className="legal-cut" aria-hidden>✂ ─────────────────────────────────────────</div>
      <p><strong>Coupon à rendre à l’enseignant</strong></p>
      <p>Je soussigné(e) …………………………………… responsable légal de …………………………………… (classe : …………) atteste avoir pris connaissance de cette note.</p>
      <p>Date et signature :</p>
    </div>
  </Shell>;
}

export function CoachPage() {
  return <Shell title="Coach Pi : ce qu’il fait, et ses limites">
    <p className="legal-lead">Coach Pi est l’assistant de PiSan. Il s’appuie sur un modèle d’intelligence artificielle : il aide à chercher, il ne remplace ni ta réflexion, ni ton professeur. <strong>Comme toute IA, il peut se tromper.</strong> Voici, en toute transparence, comment il fonctionne.</p>

    <h2>Ce que Coach Pi fait</h2>
    <ul>
      <li>Il t’aide sur <strong>l’exercice que tu es en train de faire</strong>, en suivant la démarche de PiSan : dire le problème avec tes mots, manipuler, faire un schéma, puis calculer.</li>
      <li>Il donne <strong>des indices et des questions</strong>, une étape à la fois, adaptés à ta classe et dans ta langue.</li>
      <li>Si tu proposes une réponse, il t’aide à <strong>vérifier ta démarche</strong> sans te dire directement si le résultat est juste.</li>
    </ul>

    <h2>Ce qu’il ne fait pas, volontairement</h2>
    <ul>
      <li><strong>Il ne donne pas la réponse.</strong> C’est une consigne qu’il reçoit, et en plus le serveur relit chacune de ses réponses : si elle contient le résultat attendu, elle est remplacée par un simple indice.</li>
      <li><strong>Il ne corrige pas tes exercices.</strong> La correction est faite par le serveur de PiSan, par un calcul exact, jamais par l’IA. Ta note ne peut donc pas dépendre d’une erreur du coach.</li>
      <li><strong>Il se tait pendant les tests</strong> (test de positionnement, diagnostic) : ce que tu y fais doit refléter ce que tu sais seul.</li>
      <li>Il ne répond qu’aux questions de maths liées à l’exercice, et il ne te demande jamais d’informations personnelles.</li>
    </ul>

    <h2>Ses limites</h2>
    <ul>
      <li><strong>Il peut se tromper</strong> : une erreur de calcul ou de signe dans un indice, une explication maladroite. Si quelque chose te paraît bizarre, demande-lui de réexpliquer, compare avec ta leçon, ou utilise « Signaler une erreur ».</li>
      <li><strong>Comprendre une aide ne veut pas dire savoir refaire.</strong> Après un exercice où tu as eu besoin du coach, refais une série sans lui : niveau 2 « En autonomie », puis niveau 3 « Défi mélangé ».</li>
      <li><strong>Ton professeur reste la référence</strong> pour la méthode et la rédaction attendues en classe.</li>
      <li>Son nombre de messages est limité chaque jour, pour que tu cherches d’abord par toi-même.</li>
    </ul>

    <h2>Tes données</h2>
    <p>Ton message et l’exercice en cours sont envoyés, sans ton pseudonyme, à un fournisseur de modèle d’IA (OpenAI) par la passerelle de Lovable, avec une demande de non-conservation. <strong>PiSan ne garde pas tes conversations.</strong> Le coach est accessible aux élèves d’une classe ou d’un établissement partenaire. Détails : <Link to="/confidentialite">confidentialité</Link>.</p>
  </Shell>;
}

/** Liens vers les pages d'information (pieds de page de l'accueil, de l'espace enseignant et du compte). */
export function LegalLinks({ lang, teacher = false }: { lang: 'fr' | 'en' | 'ar' | 'es'; teacher?: boolean }) {
  const privacy = { fr: 'Confidentialité et mentions légales', en: 'Privacy & legal notice', ar: 'الخصوصية والإشعار القانوني', es: 'Privacidad y aviso legal' }[lang];
  const families = { fr: 'Note aux familles', en: 'Note for families', ar: 'رسالة إلى الأسر', es: 'Nota para las familias' }[lang];
  const coach = { fr: 'Coach Pi et ses limites', en: 'Coach Pi and its limits', ar: 'المدرّب Pi وحدوده', es: 'Coach Pi y sus límites' }[lang];
  return <nav className="legal-links" aria-label={privacy}><Link to="/confidentialite">{privacy}</Link><Link to="/coach">{coach}</Link>{teacher && <Link to="/familles">{families}</Link>}</nav>;
}
