import { GetStaticPaths, GetStaticProps } from 'next';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import { Container, Thumbnail, Header, Description } from '../../styles/pages/episodes';

type Episode = {
  id: string,
  title: string,
  thumbnail: string,
  members: string,
  duration: number,
  durationAsString: string,
  publishedAt: string,
  url: string,
  description: string,
}

type EpisodeProps = {
  episode: Episode,
}

export default function Episode({ episode }: EpisodeProps) {
  const router = useRouter();

  if (router.isFallback) return <p>Carregando...</p>

  return (
    <Container>
      <Thumbnail>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>

        <Image
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit="cover"
        />

        <button type="button">
          <img src="/play.svg" alt="Tocar episódio" />
        </button>
      </Thumbnail>

      <Header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </Header>

      <Description dangerouslySetInnerHTML={{ __html: episode.description }} />
    </Container>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
    ],
    fallback: true
  }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params;

  const { data } = await api.get(`/episodes/${slug}`);

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), "d MMM yy", { locale: ptBR }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(data.file.duration),
    description: data.description,
    url: data.file.url,
  }

  return {
    props: {
      episode
    },
    revalidate: 60 * 60 * 24, //24 hrs
  }
}