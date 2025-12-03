import { ArticleCard } from './ArticleCard';
import { Badge } from './ui/badge';
import { BookOpen, GraduationCap, ArrowRight, Star, Sparkles, Library, X, Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

// Импорт локальных обложек статей
import articleCover1 from '../assets/articles/article-1.svg';
import articleCover2 from '../assets/articles/article-2.svg';
import articleCover3 from '../assets/articles/article-3.svg';
import articleCover4 from '../assets/articles/article-4.svg';
import articleCover5 from '../assets/articles/article-5.svg';
import articleCover6 from '../assets/articles/article-6.svg';
import articleCover7 from '../assets/articles/article-7.svg';
import articleCover8 from '../assets/articles/article-8.svg';

export interface Article {
  id: number;
  title: string;
  description: string;
  cover: string;
  readTime: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: string[];
}

const articles: Article[] = [
  {
    id: 1,
    title: 'Как правильно выбрать букмекерскую контору',
    description: 'Подробное руководство по выбору надёжного букмекера. Разбираем критерии оценки: лицензия, коэффициенты, линия, бонусы и скорость выплат.',
    cover: articleCover1,
    readTime: 4,
    category: 'Основы',
    difficulty: 'beginner',
    content: [
      'Выбор надежного букмекера — важный шаг на пути к успешным ставкам. В этом руководстве мы рассмотрим ключевые критерии, которые помогут вам сделать правильный выбор.',
      '1. **Лицензия и регулирование**: Убедитесь, что букмекерская контора имеет действующую лицензию и регулируется надежными органами. Это гарантирует, что ваши средства защищены законом.',
      '2. **Коэффициенты**: Высокие коэффициенты могут быть признаком недостаточной прозрачности. Сравнивайте коэффициенты с другими конторами и проверяйте их реальность.',
      '3. **Линия ставок**: Разнообразие доступных ставок и спортивных событий важно для стратегического планирования. Убедитесь, что контора предлагает широкий выбор.',
      '4. **Бонусы и промоакции**: Некоторые букмекеры предлагают привлекательные бонусы и промоакции. Оценивайте их условия и сроки действия.',
      '5. **Скорость выплат**: Быстрая обработка заявок на выплату выигрышей — важный фактор. Убедитесь, что контора оперативно выполняет свои обязательства.',
    ],
  },
  {
    id: 2,
    title: 'Что такое маржа букмекера и как она влияет на ставки',
    description: 'Разбираемся в понятии маржи, учимся её рассчитывать и понимать, как она влияет на вашу прибыль в долгосрочной перспективе.',
    cover: articleCover2,
    readTime: 3,
    category: 'Основы',
    difficulty: 'beginner',
    content: [
      'Маржа букмекера — это разница между суммой ставок и суммой выигрышей, которую он выплачивает. В этом руководстве мы рассмотрим, как она влияет на ваши ставки.',
      '1. **Определение маржи**: Маржа — это процент, который букмекер оставляет себе с каждой ставки. Например, если маржа составляет 5%, то из каждой ставки букмекер оставляет себе 5%.',
      '2. **Расчет маржи**: Маржа рассчитывается по формуле: (1 / коэффициент) * 100%. Например, если коэффициент составляет 2.0, то маржа составляет 50%.',
      '3. **Влияние маржи на прибыль**: Высокая маржа снижает ваши шансы на прибыль в долгосрочной перспективе. Учитывайте маржу при выборе ставок и контор.',
      '4. **Примеры**: Предположим, вы делаете ставку на победу команды с коэффициентом 2.0. Если маржа составляет 5%, то фактическая вероятность победы команды составляет 52.5%.',
    ],
  },
  {
    id: 3,
    title: 'Управление банкроллом: стратегии и правила',
    description: 'Как правильно управлять своим бюджетом для ставок. Фиксированные ставки, проценты от банка, критерий Келли и другие методы.',
    cover: articleCover3,
    readTime: 5,
    category: 'Стратегии',
    difficulty: 'intermediate',
    content: [
      'Управление банкроллом — ключевой аспект успешного беттинга. В этом руководстве мы рассмотрим различные стратегии и правила, которые помогут вам управлять бюджетом.',
      '1. **Фиксированные ставки**: Определите фиксированную сумму, которую вы готовы рисковать на каждой ставке. Это поможет избежать риска потери всего банкролла.',
      '2. **Проценты от банка**: Ограничьте ставки процентом от вашего банкролла. Например, не делайте ставок больше 5% от вашего общего бюджета.',
      '3. **Критерий Келли**: Этот критерий помогает определить оптимальную дробную ставку на основе вероятности события и коэффициента. Формула: (p * b - (1 - p)) / b, где p — вероятность события, b — коэффициент.',
      '4. **Стоп-лоссы**: Установите пределы потерь, после которых вы прекращаете делать ставки. Это поможет избежать значительных убытков.',
      '5. **Регулярный анализ**: Периодически анализируйте свои ставки и результаты. Это поможет вам улучшить стратегию и адаптироваться к изменениям.',
    ],
  },
  {
    id: 4,
    title: 'Value betting: поиск ценных коэффициентов',
    description: 'Продвинутая стратегия поиска переоценённых событий. Учимся находить расхождения между реальной вероятностью и коэффициентами букмекера.',
    cover: articleCover4,
    readTime: 5,
    category: 'Стратегии',
    difficulty: 'advanced',
    content: [
      'Value betting — это стратегия, которая позволяет находить переоценённые события и делать ставки с положительным ожидаемым выигрышем. В этом руководстве мы рассмотрим, как это сделать.',
      '1. **Определение value betting**: Value betting — это ставка, при которой ваша вероятность события выше, чем вероятность, предложенная букмекером. Это позволяет получить положительный ожидаемый выигрыш.',
      '2. **Расчет вероятности**: Определите реальную вероятность события на основе анализа статистики и других факторов. Это может включать в себя анализ прошлых результатов, текущую форму команды и другие показатели.',
      '3. **Сравнение с коэффициентом**: Сравните вашу вероятность с коэффициентом, предложенным букмекером. Если ваша вероятность выше, то это value betting.',
      '4. **Примеры**: Предположим, вы анализируете матч между командами A и B. Ваша вероятность победы команды A составляет 60%, а коэффициент букмекера составляет 1.8. В этом случае это value betting, так как ваша вероятность выше, чем вероятность, предложенная букмекером.',
      '5. **Управление рисками**: При value betting важно управлять рисками. Используйте стратегии управления банкроллом, такие как фиксированные ставки и проценты от банка.',
    ],
  },
  {
    id: 5,
    title: 'Анализ статистики в ставках на футбол',
    description: 'Какие метрики важны при анализе футбольных матчей: xG, владение мячом, удары в створ, форма команды и другие показатели.',
    cover: articleCover5,
    readTime: 4,
    category: 'Анализ',
    difficulty: 'intermediate',
    content: [
      'Анализ статистики — важный инструмент для успешного беттинга на футбол. В этом руководстве мы рассмотрим ключевые метрики, которые помогут вам оценить вероятность победы команд.',
      '1. **xG (Expected Goals)**: Это метрика, которая оценивает вероятность гола на основе анализа ударов. Высокий xG указывает на высокую вероятность победы команды.',
      '2. **Владение мячом**: Команда с большим владением мячом имеет больше шансов на победу. Однако это не всегда гарантирует результат, так как важно, как команда использует время на поле.',
      '3. **Удары в створ**: Чем больше ударов в створ, тем выше вероятность гола. Однако важно учитывать качество ударов и эффективность команды.',
      '4. **Форма команды**: Текущая форма команды важна для оценки вероятности победы. Команда с хорошей формой имеет больше шансов на успех.',
      '5. **Другие показатели**: Учитывайте также другие показатели, такие как количество пенальти, желтые и красные карточки, количество передач и другие.',
    ],
  },
  {
    id: 6,
    title: 'Психология беттинга: как избежать типичных ошибок',
    description: 'Разбираем психологические ловушки: погоня за проигрышем, ставки на любимую команду, влияние эмоций и способы их контроля.',
    cover: articleCover6,
    readTime: 4,
    category: 'Психология',
    difficulty: 'intermediate',
    content: [
      'Психология беттинга — важный аспект, который может влиять на ваши ставки и результаты. В этом руководстве мы рассмотрим типичные психологические ловушки и способы их контроля.',
      '1. **Погоня за проигрышем**: Не пытайтесь вернуть проигрыши, делая большую ставку. Это может привести к значительным убыткам. Всегда управляйте рисками и следуйте своей стратегии.',
      '2. **Ставки на любимую команду**: Избегайте ставок на любимую команду, так как эмоции могут повлиять на ваше решение. Оценивайте команды объективно и на основе анализа статистики.',
      '3. **Влияние эмоций**: Эмоции могут влиять на ваши ставки и результаты. Попробуйте оставаться спокойным и объективным при принятии решений.',
      '4. **Способы контроля**: Используйте стратегии управления рисками, такие как фиксированные ставки и проценты от банка. Это поможет избежать значительных убытков.',
      '5. **Регулярный анализ**: Периодически анализируйте свои ставки и результаты. Это поможет вам улучшить стратегию и адаптироваться к изменениям.',
    ],
  },
  {
    id: 7,
    title: 'Live-ставки: особенности и стратегии',
    description: 'Как делать ставки в режиме реального времени. Преимущества лайв-беттинга, инструменты анализа и эффективные тактики.',
    cover: articleCover7,
    readTime: 5,
    category: 'Стратегии',
    difficulty: 'advanced',
    content: [
      'Live-ставки — это ставки, которые делаются в режиме реального времени во время проведения события. В этом руководстве мы рассмотрим преимущества лайв-беттинга и эффективные стратегии.',
      '1. **Преимущества лайв-беттинга**: Лайв-ставки позволяют реагировать на изменения в ходе события и делать ставки на основе актуальной информации. Это может увеличить ваши шансы на прибыль.',
      '2. **Инструменты анализа**: Используйте инструменты анализа, такие как статистика матча, текущая форма команды и другие показатели. Это поможет вам сделать правильные ставки.',
      '3. **Эффективные тактики**: Используйте стратегии управления рисками, такие как фиксированные ставки и проценты от банка. Это поможет избежать значительных убытков.',
      '4. **Примеры**: Предположим, вы делаете ставку на победу команды A в матче с командой B. Если в ходе матча команда A начинает проигрывать, вы можете сделать ставку на победу команды B. Это может увеличить ваши шансы на прибыль.',
      '5. **Регулярный анализ**: Периодически анализируйте свои ставки и результаты. Это поможет вам улучшить стратегию и адаптироваться к изменениям.',
    ],
  },
  {
    id: 8,
    title: 'Экспресс-ставки: риски и возможности',
    description: 'Всё об экспрессах: как их составлять, какие события выбирать, как рассчитывать вероятность прохода и управлять рисками.',
    cover: articleCover8,
    readTime: 4,
    category: 'Основы',
    difficulty: 'beginner',
    content: [
      'Экспресс-ставки — это ставки, которые объединяют несколько событий в одну ставку. В этом руководстве мы рассмотрим, как составлять экспресс-ставки и управлять рисками.',
      '1. **Составление экспресса**: Выберите несколько событий, которые вы считаете вероятными. Обычно экспресс-ставки состоят из 2-5 событий.',
      '2. **Выбор событий**: Выбирайте события, которые вы хорошо знаете и уверены в их исходе. Это поможет увеличить ваши шансы на прибыль.',
      '3. **Расчет вероятности**: Определите вероятность прохода каждого события. Это поможет вам оценить вероятность прохода всего экспресса.',
      '4. **Управление рисками**: Используйте стратегии управления рисками, такие как фиксированные ставки и проценты от банка. Это поможет избежать значительных убытков.',
      '5. **Примеры**: Предположим, вы делаете экспресс-ставку на победу команды A в матче с командой B и на победу команды C в матче с командой D. Если вероятность победы команды A составляет 60%, а вероятность победы команды C составляет 50%, то вероятность прохода всего экспресса составляет 30%. Это может быть прибыльной ставкой.',
    ],
  },
];

export function ArticlesTab() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  const totalReadTime = articles.reduce((sum, a) => sum + a.readTime, 0);
  const categories = Array.from(new Set(articles.map(a => a.category)));
  
  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1);
  
  const filters = [
    { id: 'all', label: 'Все статьи', count: articles.length },
    ...categories.map(cat => ({
      id: cat.toLowerCase(),
      label: cat,
      count: articles.filter(a => a.category === cat).length
    }))
  ];

  return (
    <div className="space-y-8 px-4">
      {/* Hero Welcome Section */}
      <div className="relative bg-gradient-to-br from-green-400/10 via-zinc-900/50 to-zinc-900/50 border border-green-400/20 rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-green-400/20 flex items-center justify-center">
              <GraduationCap className="size-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl text-white text-[24px] font-bold">Обучающие материалы</h2>
              <p className="text-sm text-zinc-400 text-[15px] font-bold">Путь к профессиональным ставкам начинается здесь</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Article Hero Card */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-lg text-white text-[24px] font-bold">
            <Star className="size-5 text-green-400" />
            Рекомендуем начать с
          </h3>
        </div>
        
        {/* Large Hero Card */}
        <div 
          onClick={() => setSelectedArticle(featuredArticle)}
          className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden group cursor-pointer hover:border-green-400/30 transition-all"
        >
          <div className="grid md:grid-cols-2">
            <div className="relative h-64 md:h-full overflow-hidden">
              <ImageWithFallback
                src={featuredArticle.cover}
                alt={featuredArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900/80 md:to-zinc-900" />
              <div className="absolute top-3 left-3">
                <Badge className="bg-zinc-900/50 text-zinc-400 border-zinc-700 h-8 px-3 text-xs">
                  {featuredArticle.category}
                </Badge>
              </div>
            </div>
            
            <div className="p-6 flex flex-col justify-center">
              <h3 className="text-lg text-white mb-4 font-bold text-[20px]">{featuredArticle.title}</h3>
              
              <p className="text-zinc-400 mb-6 leading-relaxed font-bold text-[16px]">
                {featuredArticle.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <Clock className="size-3" />
                  <span className="font-bold text-[14px]">{featuredArticle.readTime} мин</span>
                </div>
                <button className="px-6 h-10 bg-green-400 text-zinc-900 text-sm rounded-lg hover:bg-green-500 transition-colors flex items-center gap-2 text-[16px] font-bold">
                  Читать
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-zinc-800 my-8" />
      </div>

      {/* Other Articles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-lg text-white text-[24px] font-bold">
            <Library className="size-5 text-green-400" />
            Все материалы
          </h3>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {otherArticles.map((article) => (
            <ArticleCard 
              key={article.id} 
              article={article}
              onClick={() => setSelectedArticle(article)}
            />
          ))}
        </div>
      </div>

      {/* Article Modal */}
      <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800 p-0">
          <VisuallyHidden.Root>
            <DialogTitle>Article</DialogTitle>
            <DialogDescription>Article content</DialogDescription>
          </VisuallyHidden.Root>
          {selectedArticle && (
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 z-10 size-10 rounded-full bg-zinc-900/80 border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 transition-colors font-normal"
              >
                <X className="size-5 text-zinc-400" />
              </button>

              {/* Cover Image */}
              <div className="relative h-80 overflow-hidden">
                <ImageWithFallback
                  src={selectedArticle.cover}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <Badge className="bg-green-400/20 text-green-400 border-green-400/30 h-8 px-3 text-xs mb-4 font-bold text-[14px]">
                    {selectedArticle.category}
                  </Badge>
                  <h2 className="text-2xl text-white mb-2 font-bold">{selectedArticle.title}</h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="prose prose-invert prose-green max-w-none">
                  {selectedArticle.content.map((paragraph, index) => (
                    <p key={index} className="text-zinc-300 leading-relaxed mb-4 font-bold text-[16px]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}