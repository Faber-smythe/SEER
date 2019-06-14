<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Twig\Environment;
use Symfony\Component\HttpFoundation\Response;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\HttpFoundation\Request;
use App\Repository\GameRepository;
use App\Repository\WorldRepository;
use App\Repository\ItemTextRepository;
use App\Repository\ItemImageRepository;
use App\Entity\User;
use Symfony\Component\HttpFoundation\JsonResponse;

class SightController extends BaseController
{
  public function __construct(GameRepository $gamerepository, WorldRepository $worldrepository, ItemTextRepository $itemtextrepository, ItemImageRepository $itemimagerepository, ObjectManager $em)
  {
    $this->gamerepository = $gamerepository;
    $this->worldrepository = $worldrepository;
    $this->itemtextrepository = $itemtextrepository;
    $this->itemimagerepository = $itemimagerepository;
    $this->manager = $em;

  }

  /* ----------------------
  /* API FETCH METHODS
  /* -------------------- */


  /**
   * @Route("worlds/{world}/{game}/data/{type}", name="json.items")
   */
  public function getData($world, $game, $type)
  {
    $items = null;
    if($type == 'texts'){
      $items = $this->itemtextrepository->findItemTexts(
        $this->userId(),
        $this->worldId($world),
        $this->gameId($world, $game)
      );
    }
    if($type == 'images'){
      $items = $this->itemimagerepository->findItemImages(
        $this->userId(),
        $this->worldId($world),
        $this->gameId($world, $game)
      );
    }
    if($type == 'meta-info'){
      $metaInfo = (object) [
        'userId' => $this->userId(),
        'userName' => $this->getUser()->getUsername(),
        'worldId' => $this->worldId($world),
        'gameId' => $this->gameId($world, $game),
      ];
    }

    if($type == 'texts' || $type == 'images'){
      $json = $this->get('serializer')->serialize($items, 'json');
      return new JsonResponse($json, 200, [], true);
    }
    if($type == 'meta-info'){
      return new JsonResponse($metaInfo);
    }
  }


  // ===========================================
  // DISPLAY FOR THE MAIN PAGE OF THE REACT APP
  // ===========================================

  /**
   * @Route("worlds/{world}/{game}", name="sight")
   * @return Response [description]
   */
  public function sight_display($world, $game): Response
  {
    $texts = $this->itemtextrepository->findItemTexts(
      $this->userId(),
      $this->worldId($world),
      $this->gameId($world, $game)
    );
    $worldEntity = $this->worldrepository->findWorldBySlug(
      $this->userId(),
      $world
    );
    return $this->render('sight.html.twig', [
      'world' => $worldEntity,
      'game' => $game,
      'user' => $this->getUser()->getUsername(),
    ]);
  }

}

 ?>
