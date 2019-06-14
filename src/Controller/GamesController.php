<?php

namespace App\Controller;

use Symfony\Component\Routing\Annotation\Route;
use Twig\Environment;
use Symfony\Component\HttpFoundation\Response;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\HttpFoundation\Request;
use App\Repository\WorldRepository ;
use App\Repository\GameRepository;
use App\Repository\ItemTextRepository;
use App\Repository\ItemImageRepository;
use App\Form\GameType;
use App\Entity\Game;
use App\Entity\User;
use App\Entity\ItemText;
use Cocur\Slugify\Slugify;

class GamesController extends BaseController
{
  public function __construct(WorldRepository $worldrepository, GameRepository $gamerepository, ItemTextRepository $itemtextrepository, ItemImageRepository $itemimagerepository, ObjectManager $em)
  {
    $this->worldrepository = $worldrepository;
    $this->gamerepository = $gamerepository;
    $this->itemtextrepository = $itemtextrepository;
    $this->itemimagerepository = $itemimagerepository;
    $this->manager = $em;
  }

  // -----------------------
  // THIRD LEVEL PAGES
  // -----------------------
  //  CRUD FOR GAMES
  //  -display index
  //  -display creating game form and redirect to index
  //  -display editing game form and redirect to index
  //  -processing deleting game and redirect to index

  /**
   * @Route("worlds/{world}", name="games.index")
   * @return Response
   */
  public function games_index($world): Response
  {
    $world_entity = $this->worldrepository->findWorldBySlug($this->userId(), $world);
    $games = $this->gamerepository->findGamesByWorld(
      $this->userId(),
      $this->worldId($world)
    );
    return $this->render('games/index.html.twig', [
      'world' => $world_entity,
      'games' => $games,
      'user' => $this->getUser()->getUsername(),
    ]);
  }

  /**
   * @Route("worlds/{world}/new-game", name="games.new")
   * @return Response
   */
  public function games_new(Request $request, $world): Response
  {
    $world_entity = $this->worldrepository->findWorldBySlug($this->userId(), $world);

    $game = new Game;
    // set non-customizable fields
    $game->setUser($this->userId());
    $game->setWorld($this->worldrepository->findWorldBySlug(
      $this->userId(),
      $world
      )->getId());
    $game->setItems(1);
    $game->setDate(new \DateTime('now'));

    $form = $this->createForm(GameType::class, $game, array());
    $form -> handleRequest($request);


    // If a game has been created, process it
    if($form->isSubmitted() && $form->isValid()) {
      // automatically create the slug for this new game and flush
      $game->setSlug((new Slugify())->slugify($game->getName()));
      $this->manager->persist($game);
      $this->manager->flush();
      // automatically create the text item for the codex and flush again
      $codex = new ItemText;
      $codex->setUser($this->userId())
        ->setWorld($this->worldId($world))
        ->setGame($game->getId())
        ->setName('Codex')
        ->setSlug('codex')
        ->setContent($form->getData()->getCodex())
        ->setPinned(true);
      $this->manager->persist($codex);
      $this->manager->flush();

      // redirec to index
      return $this->redirectToRoute('games.index', [
        'world' => $world,
      ]);
    }

    // else display the creation form
    return $this->render('games/new.html.twig', [
      'form' => $form->createView(),
      'world' => $world_entity,
      'user' => $this->getUser()->getUsername(),
    ]);
  }

  /**
   * @Route("/worlds/{world}/edit/{game}", name="games.edit")
   * @return Response
   */
  public function games_edit($world, $game, Request $request): Response
  {
    $world_entity = $this->worldrepository->findWorldBySlug($this->userId(), $world);
    $game = $this->gamerepository->findGameBySlug(
      $this->userId(),
      $this->worldrepository->findWorldBySlug(
        $this->userId(),
        $world
      )->getId(),
      $game
    );

    $form = $this->createForm(GameType::class, $game, array(
      'requirecodex' => false,
    ));
    $form -> handleRequest($request);

    // If a game has been edited, process the changes
    if($form->isSubmitted() && $form->isValid()) {
      // automatically update the slug in case the name changed
      $game->setSlug((new Slugify())->slugify($form->getData()->getName()));
      // save it
      $this->manager->persist($game);
      $this->manager->flush();
      // redirect to index
      return $this->redirectToRoute('games.index', [
        'world' => $world,
      ]);
    }

    // else display the edition form
    return $this->render('games/edit.html.twig', [
      'form' => $form->createView(),
      'world' => $world_entity,
      'user' => $this->getUser()->getUsername(),
    ]);
  }

  /**
  * @Route("/worlds/{world}/delete/{id}", name="games.delete")
   * @param  Game      $game     [get the right entity directly through the ID parameter]
   * @return Response
   */
  public function games_delete($world, Game $game,Request $request): Response
  {
    $world_entity = $this->worldrepository->findWorldBySlug($this->userId(), $world);

    // Csrf token prevents from deleting directly via URL
    if($this->isCsrfTokenValid('delete' . $game->getId(), $request->get('_token'))){
      //loop through this game's text Items
      $texts = $this->itemtextrepository->findItemTexts(
        $this->userId(),
        $this->worldId($world),
        $game->getId()
      );
      foreach($texts as $text){
        $this->manager->remove($text);
      }
      //loop through this game's image Items /!\ NOT IMPLEMENTED YET
      $images = $this->itemimagerepository->findItemImages(
        $this->userId(),
        $this->worldId($world),
        $game->getId()
      );
      foreach($images as $image){
        $this->manager->remove($image);
      }
      $this->manager->remove($game);

      // delete this game, and the items within.
      $this->manager->flush();

      // redirect to index
      return $this->redirectToRoute('games.index', [
        'world' => $world,
      ]);
    }
    // if the URL was called without the valid Csrf token.
    return $this->redirectToRoute('games.index', [
      'world' => $world,
    ]);
  }
}

 ?>
